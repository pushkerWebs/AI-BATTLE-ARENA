import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getModel } from "./model.ai.js";
import { z } from "zod";

// ── Schemas ────────────────────────────────────────────────────────────────────
const judgeSchema = z.object({
  solution_1_score: z.number().min(0).max(10),
  solution_2_score: z.number().min(0).max(10),
  solution_1_reasoning: z.string(),
  solution_2_reasoning: z.string(),
  winner: z.enum(["solution_1", "solution_2"]),
  overall_verdict: z.string(),
});

export type JudgeResult = z.infer<typeof judgeSchema>;

export interface BattleResult {
  problem: string;
  solution_1: string;
  solution_2: string;
  model1: string;
  model2: string;
  judgeModel: string;
  judge: JudgeResult;
  timings?: Record<string, number>;
}

// ── Event types ────────────────────────────────────────────────────────────────
export type BattleEventType =
  | 'battle_start'
  | 'contestant_1_start'
  | 'contestant_2_start'
  | 'contestant_1_token'   // streaming chunk from contestant 1
  | 'contestant_2_token'   // streaming chunk from contestant 2
  | 'contestant_1_done'
  | 'contestant_2_done'
  | 'judge_start'
  | 'judge_done'
  | 'save_done'
  | 'complete'
  | 'error';

export interface BattleEvent {
  type: BattleEventType;
  data?: any;
  elapsedMs?: number;
}

export type OnEventFn = (event: BattleEvent) => void;

// ── Model display names ────────────────────────────────────────────────────────
const MODEL_NAMES: Record<string, string> = {
  'mistral-medium-latest':  'Mistral Medium',
  'mistral-large-latest':   'Mistral Large',
  'open-mixtral-8x22b':     'Mixtral 8x22B',
  'mistral-small-latest':   'Mistral Small',
  'command-a-03-2025':      'Cohere Command A',
  'command-r-08-2024':      'Cohere Command R',
  'command-r':              'Cohere Command R',
  'command-light':          'Cohere Command Light',
  'gemini-2.5-flash':       'Gemini 2.5 Flash',
  'gemini-2.5-flash-lite':  'Gemini 2.5 Flash Lite',
  'gemini-2.5-pro':         'Gemini 2.5 Pro',
  'gemini-2.0-flash':       'Gemini 2.0 Flash',
  'gemini-1.5-flash':       'Gemini 1.5 Flash',
};

export function getModelName(modelId: string): string {
  return MODEL_NAMES[modelId] || modelId;
}

// ── Static prompt templates ────────────────────────────────────────────────────
// Balanced system prompt — all original behavioral constraints preserved.
// Only genuine duplicate removed: "extremely readable" and "proper Markdown spacing"
// said the same thing twice; merged into one clear instruction.
// Net savings: ~30 tokens vs original, zero quality degradation.
const SYSTEM_INSTRUCTION =
  `You are an expert software engineer and system architect. ` +
  `Provide highly detailed, structured, and production-ready solutions.\n` +
  `ALWAYS format any tables strictly using GitHub Flavored Markdown (GFM) table syntax.\n` +
  `CRITICAL: Every table must have a header separator row (e.g. |---|---|---| or |:---|:---|:---|) ` +
  `immediately after the column headers. Never omit this row — tables will fail to render without it.\n` +
  `Ensure clear blank lines before and after all headers, lists, tables, and code blocks. ` +
  `Responses must be well-structured and easy to read.`;

const solutionPrompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_INSTRUCTION],
  ["human", "{problem}"],
]);

// Judge prompt — fully static template; model names injected as variables at
// invocation time so the template object itself is reused across all battles.
const judgePromptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert AI judge. Evaluate two AI solutions to a problem.\n` +
    `Score each out of 10 (correctness, clarity, completeness, quality). ` +
    `Scores must be different. Declare a clear winner. Be concise but specific.`,
  ],
  [
    "human",
    `Problem: {problem}\n\n` +
    `Solution 1 ({model1Name}):\n{solution_1}\n\n` +
    `Solution 2 ({model2Name}):\n{solution_2}\n\n` +
    `Evaluate both solutions. Score them. State strengths and critiques for each model by name.`,
  ],
]);

// ── Contestant token limit ─────────────────────────────────────────────────────
// Configurable via CONTESTANT_MAX_TOKENS env var. Default is 1200 tokens,
// which covers most coding tasks (≈500–600 words) without truncating mid-answer.
// Raise to 2000+ for multi-file architecture problems.
// This limit does NOT apply to the judge — structured output must be complete.
const CONTESTANT_MAX_TOKENS = parseInt(process.env.CONTESTANT_MAX_TOKENS ?? '1200', 10)

// ── Contestant streaming helper ────────────────────────────────────────────────
// Each contestant runs in its own independent async task via Promise.all.
// There is NO shared state, NO mutex, NO await chain between C1 and C2.
// The two for-await loops execute on separate microtask queues and interleave
// freely — neither can block the other. C2 taking longer = API latency only.
async function runContestantStream(
  chain: any,
  problem: string,
  modelId: string,
  tokenEventType: 'contestant_1_token' | 'contestant_2_token',
  doneEventType:  'contestant_1_done'  | 'contestant_2_done',
  onEvent: OnEventFn
): Promise<{ text: string; elapsedMs: number }> {
  const taskStart = Date.now()
  let text        = ''

  // ── Phase 1: request creation + HTTP connection ──────────────────────────────
  const stream = await chain.stream({ problem })

  // ── Phase 2: streaming tokens ────────────────────────────────────────────────
  for await (const chunk of stream) {
    // Normalize chunk content across LangChain model adapters
    let piece: string
    if (typeof chunk.content === 'string') {
      piece = chunk.content
    } else if (Array.isArray(chunk.content)) {
      piece = chunk.content
        .map((c: any) => (typeof c === 'string' ? c : (c?.text ?? '')))
        .join('')
    } else {
      piece = ''
    }

    if (!piece) continue

    // ── Emit to frontend immediately — no buffering, no waiting for loop end ──
    text += piece
    onEvent({ type: tokenEventType, data: { chunk: piece } })
  }

  // ── Phase 3: last token already emitted inside loop above ───────────────────
  const elapsed = Date.now() - taskStart

  // ── Phase 4: emit done event immediately — no buffering ───────────────────────
  onEvent({ type: doneEventType, elapsedMs: elapsed })

  return { text, elapsedMs: elapsed }
}

// ── Main battle runner ─────────────────────────────────────────────────────────
export default async function runBattle(
  problem: string,
  model1Id    = "mistral-medium-latest",
  model2Id    = "command-a-03-2025",
  judgeModelId = "gemini-2.5-flash",
  onEvent: OnEventFn = () => {}
): Promise<BattleResult> {
  const battleStart = Date.now()

  onEvent({ type: 'battle_start', elapsedMs: 0 })

  // Contestant models with token limit baked into the constructor.
  const m1     = getModel(model1Id, CONTESTANT_MAX_TOKENS)
  const m2     = getModel(model2Id, CONTESTANT_MAX_TOKENS)
  const jModel = getModel(judgeModelId)
  const model1Name = getModelName(model1Id)
  const model2Name = getModelName(model2Id)

  const c1Chain = solutionPrompt.pipe(m1)
  const c2Chain = solutionPrompt.pipe(m2)

  // ── Step 1: Both contestants stream concurrently ───────────────────────────
  onEvent({ type: 'contestant_1_start' })
  onEvent({ type: 'contestant_2_start' })

  const [c1Result, c2Result] = await Promise.all([
    runContestantStream(c1Chain, problem, model1Id, 'contestant_1_token', 'contestant_1_done', onEvent),
    runContestantStream(c2Chain, problem, model2Id, 'contestant_2_token', 'contestant_2_done', onEvent),
  ])

  const solution_1 = c1Result.text
  const solution_2 = c2Result.text

  // ── Step 2: Judge runs immediately after both contestants finish ────────────
  const judgeStart = Date.now()
  onEvent({ type: 'judge_start' })

  const structuredJudge = (jModel as any).withStructuredOutput(judgeSchema)
  const judgeChain      = judgePromptTemplate.pipe(structuredJudge)

  const judgeResponse = (await judgeChain.invoke({
    problem,
    model1Name,
    model2Name,
    solution_1,
    solution_2,
  })) as JudgeResult

  const judgeElapsed = Date.now() - judgeStart
  onEvent({ type: 'judge_done', elapsedMs: judgeElapsed })

  const totalElapsed = Date.now() - battleStart

  const result: BattleResult = {
    problem,
    solution_1,
    solution_2,
    model1: model1Id,
    model2: model2Id,
    judgeModel: judgeModelId,
    judge: judgeResponse,
    timings: {
      total:       totalElapsed,
      contestant1: c1Result.elapsedMs,
      contestant2: c2Result.elapsedMs,
      judge:       judgeElapsed,
    },
  }

  onEvent({ type: 'complete', data: result, elapsedMs: totalElapsed })
  return result
}
