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

// ── Connect to MongoDB ───────────────────────────────────────────────────────
mongoose
  .connect(config.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB (AI-BATTLE)'))
  .catch((err) => console.error('❌ MongoDB connection error:', err))

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (_req: any, res: any) => {
  res.json({ status: 'AI Battle Arena API is running 🚀' })
})

app.use('/auth', authRoutes)

// Single-flight active requests cache to collapse duplicate / concurrent battle runs
const activeBattles = new Map<string, Promise<any>>()

app.post('/battle', async (req: any, res: any) => {
  try {
    const { problem, model1, model2, judgeModel } = req.body

    if (!problem || typeof problem !== 'string' || problem.trim() === '') {
      return res.status(400).json({ error: 'A "problem" string is required in the request body.' })
    }

    // Optional: extract user ID if authenticated
    let userId: any = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1]
        const decoded: any = jwt.verify(token, config.JWT_SECRET)
        userId = decoded.userId
      } catch (jwtErr) {
        // Ignore invalid token verification errors at extraction step
      }
    }

    // Deduplication Key
    const requestKey = JSON.stringify({
      userId,
      problem: problem.trim(),
      model1,
      model2,
      judgeModel,
    })

    // If an identical battle runs concurrently, reuse its promise
    if (activeBattles.has(requestKey)) {
      console.log(`[Battle] Collapsing duplicate concurrent request for user: ${userId || 'anonymous'}`)
      const cachedResult = await activeBattles.get(requestKey)
      return res.json(cachedResult)
    }

    // Execute the battle and database save
    const runAndSaveBattle = async () => {
      console.log(`[Battle] Starting: "${problem.substring(0, 60)}...". Models: ${model1} vs ${model2} (Judge: ${judgeModel})`)
      const result = await runBattle(problem.trim(), model1, model2, judgeModel)
      console.log(`[Battle] Done. Winner: ${result.judge.winner}`)

      if (userId) {
        // Increment user battleCount and save battle history
        await Promise.all([
          User.findByIdAndUpdate(userId, { $inc: { battleCount: 1 } }),
          BattleHistory.create({
            userId,
            problem: problem.trim(),
            model1,
            model2,
            judgeModel,
            solution_1: result.solution_1,
            solution_2: result.solution_2,
            judge: result.judge,
          }),
        ])
        console.log(`[Battle] Saved to history database for user: ${userId}`)
      }
      return result
    }

    const battlePromise = runAndSaveBattle()
    activeBattles.set(requestKey, battlePromise)

    try {
      const result = await battlePromise
      res.json(result)
    } finally {
      // Evict from active cache after a small safety window to allow future runs of the same prompt
      setTimeout(() => {
        activeBattles.delete(requestKey)
      }, 6000)
    }
  } catch (err: any) {
    console.error('[Battle] Error:', err)
    res.status(500).json({ error: 'Battle failed', details: err?.message || String(err) })
  }
})

export default app