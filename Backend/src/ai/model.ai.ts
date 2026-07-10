import { ChatGoogle } from "@langchain/google"
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatCohere } from "@langchain/cohere"
import config from "../config/config.js"

// ── Singleton model cache ──────────────────────────────────────────────────────
// Model client instances are expensive to construct (they allocate HTTP agents,
// parse auth headers, etc.). We cache them by a composite key of
// "modelId:maxTokens" so each unique (model, tokenLimit) pair is only
// instantiated once for the lifetime of the server process.
//
// Why not .bind()?
// -----------------------------------------------------------
// @langchain/core v1.x removed the .bind() method from Runnable.
// In v0.x, .bind({ maxTokens }) attached call-time overrides to a chain.
// In v1.x, invocationParams() reads `this.maxTokens` directly from the
// class instance — there is no runtime-override mechanism. The correct
// approach is to bake maxTokens into the constructor, which is what we do
// here. The cache key includes the token limit so the same model ID with
// different limits produces separate (but still cached) instances.
const modelCache = new Map<string, ChatGoogle | ChatMistralAI | ChatCohere>()

const DEPRECATED_REMAP: Record<string, string> = {
  'command-r':       'command-r-08-2024',
  'command-r-plus':  'command-a-03-2025',
  'command-light':   'command-r-08-2024',
  'command-nightly': 'command-a-03-2025',
}

function createModel(
  resolvedId: string,
  maxTokens?: number
): ChatGoogle | ChatMistralAI | ChatCohere {
  if (resolvedId.startsWith('gemini') || resolvedId.includes('gemini')) {
    return new ChatGoogle({ model: resolvedId, apiKey: config.GOOGLE_API_KEY, ...(maxTokens ? { maxOutputTokens: maxTokens } : {}) })
  }
  if (
    resolvedId.startsWith('mistral') ||
    resolvedId.startsWith('open-mixtral') ||
    resolvedId.includes('mixtral')
  ) {
    return new ChatMistralAI({ model: resolvedId, apiKey: config.MISTRAL_API_KEY, ...(maxTokens ? { maxTokens } : {}) })
  }
  if (resolvedId.startsWith('command')) {
    return new ChatCohere({ model: resolvedId, apiKey: config.COHERE_API_KEY, ...(maxTokens ? { maxTokens } : {}) })
  }
  // Fallback: use default gemini flash
  return new ChatGoogle({ model: 'gemini-2.5-flash', apiKey: config.GOOGLE_API_KEY })
}

/**
 * Returns a cached model instance for the given modelId.
 * Pass `maxTokens` to get a cached instance with that token limit baked in.
 * Omit `maxTokens` (or pass undefined) for the unlimited version (used by the judge).
 */
export function getModel(
  modelId: string,
  maxTokens?: number
): ChatGoogle | ChatMistralAI | ChatCohere {
  const resolvedId = DEPRECATED_REMAP[modelId] ?? modelId
  const cacheKey   = maxTokens ? `${resolvedId}:${maxTokens}` : resolvedId

  if (!modelCache.has(cacheKey)) {
    modelCache.set(cacheKey, createModel(resolvedId, maxTokens))
  }

  return modelCache.get(cacheKey)!
}