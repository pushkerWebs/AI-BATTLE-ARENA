// @ts-expect-error Missing declaration file for 'express'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import runBattle from './ai/graph.ai.js'
import authRoutes from './auth/auth.routes.js'
import config from './config/config.js'
import User from './models/user.model.js'
import BattleHistory from './models/history.model.js'

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// ── Connect to MongoDB ────────────────────────────────────────────────────────
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB (AI-BATTLE)'))
  .catch((err) => console.error('❌ MongoDB connection error:', err))

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (_req: any, res: any) => {
  res.json({ status: 'AI Battle Arena API is running 🚀' })
})

app.use('/auth', authRoutes)

// ── Helper: extract userId from Bearer token (non-throwing) ──────────────────
function extractUserId(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.split(' ')[1]
    if (!token) return null
    const decoded: any = jwt.verify(token, config.JWT_SECRET)
    return decoded.userId ?? null
  } catch {
    return null
  }
}

// ── Helper: fire-and-forget DB save (does NOT block the response) ─────────────
function saveToDb(
  userId: string,
  problem: string,
  model1: string,
  model2: string,
  judgeModel: string,
  result: any
): void {
  Promise.all([
    User.findByIdAndUpdate(userId, { $inc: { battleCount: 1 } }),
    BattleHistory.create({
      userId,
      problem,
      model1,
      model2,
      judgeModel,
      solution_1: result.solution_1,
      solution_2: result.solution_2,
      judge: result.judge,
    }),
  ])
    .then(() => console.log(`[Battle] Saved to history for user: ${userId}`))
    .catch((err) => console.error('[Battle] DB save error (non-fatal):', err))
}

// ── Single-flight deduplication cache ────────────────────────────────────────
const activeBattles = new Map<string, Promise<any>>()

// ── POST /battle/stream  — Server-Sent Events endpoint ───────────────────────
//
//  The client opens this with a normal fetch() and reads the body as a
//  ReadableStream. Each SSE frame is a newline-delimited JSON line:
//
//    data: {"type":"contestant_1_start"}\n\n
//    data: {"type":"contestant_1_done","elapsedMs":12500}\n\n
//    ...
//    data: {"type":"complete","data":{...fullResult}}\n\n
//
app.post('/battle/stream', async (req: any, res: any) => {
  const { problem, model1, model2, judgeModel } = req.body

  if (!problem || typeof problem !== 'string' || problem.trim() === '') {
    return res.status(400).json({ error: 'A "problem" string is required.' })
  }

  const userId = extractUserId(req.headers.authorization)

  // ── SSE headers ────────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')   // disable nginx proxy buffering
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (obj: object) => {
    try {
      res.write(`data: ${JSON.stringify(obj)}\n\n`)
      // Flush if available (compression middleware can buffer otherwise)
      if (typeof (res as any).flush === 'function') (res as any).flush()
    } catch { /* client disconnected */ }
  }

  // ── Deduplication key ──────────────────────────────────────────────────────
  const requestKey = JSON.stringify({ userId, problem: problem.trim(), model1, model2, judgeModel })

  let result: any
  try {
    if (activeBattles.has(requestKey)) {
      console.log(`[Battle] Collapsing duplicate SSE request for user: ${userId ?? 'anon'}`)
      result = await activeBattles.get(requestKey)
    } else {
      const battlePromise = runBattle(
        problem.trim(),
        model1,
        model2,
        judgeModel,
        (event) => send(event)   // ← forward every stage event to the client
      )
      activeBattles.set(requestKey, battlePromise)

      try {
        result = await battlePromise
      } finally {
        setTimeout(() => activeBattles.delete(requestKey), 6000)
      }
    }

    // Fire-and-forget DB write — client already has the result, don't make them wait
    if (userId) {
      send({ type: 'save_start' })
      saveToDb(userId, problem.trim(), model1, model2, judgeModel, result)
      send({ type: 'save_done' })
    }

  } catch (err: any) {
    console.error('[Battle] Error:', err)
    send({ type: 'error', data: { error: 'Battle failed', details: err?.message || String(err) } })
  } finally {
    res.end()
  }
})

// ── POST /battle  — Legacy JSON endpoint (kept for compatibility) ─────────────
app.post('/battle', async (req: any, res: any) => {
  try {
    const { problem, model1, model2, judgeModel } = req.body

    if (!problem || typeof problem !== 'string' || problem.trim() === '') {
      return res.status(400).json({ error: 'A "problem" string is required in the request body.' })
    }

    const userId = extractUserId(req.headers.authorization)
    const requestKey = JSON.stringify({ userId, problem: problem.trim(), model1, model2, judgeModel })

    if (activeBattles.has(requestKey)) {
      const cachedResult = await activeBattles.get(requestKey)
      return res.json(cachedResult)
    }

    const runAndSave = async () => {
      const result = await runBattle(problem.trim(), model1, model2, judgeModel)
      if (userId) saveToDb(userId, problem.trim(), model1, model2, judgeModel, result)
      return result
    }

    const battlePromise = runAndSave()
    activeBattles.set(requestKey, battlePromise)

    try {
      const result = await battlePromise
      res.json(result)
    } finally {
      setTimeout(() => activeBattles.delete(requestKey), 6000)
    }
  } catch (err: any) {
    console.error('[Battle] Error:', err)
    res.status(500).json({ error: 'Battle failed', details: err?.message || String(err) })
  }
})

export default app