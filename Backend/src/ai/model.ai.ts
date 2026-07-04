import { ChatGoogle } from "@langchain/google"
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatCohere } from "@langchain/cohere"
import config from "../config/config.js"

export const geminiModel = new ChatGoogle({
    model:"gemini-2.5-flash",
  apiKey:config.GOOGLE_API_KEY
})

export const mistralModel = new ChatMistralAI({
    model:"mistral-medium-latest",
  apiKey:config.MISTRAL_API_KEY
})
 
export const cohereModel = new ChatCohere({
  model :"command-a-03-2025",
  apiKey:config.COHERE_API_KEY
})

export function getModel(modelId: string) {
  // Remap deprecated/removed model IDs to current active equivalents
  const DEPRECATED_REMAP: Record<string, string> = {
    'command-r': 'command-r-08-2024',
    'command-r-plus': 'command-a-03-2025',
    'command-light': 'command-r-08-2024',
    'command-nightly': 'command-a-03-2025',
  };
  const resolvedId = DEPRECATED_REMAP[modelId] ?? modelId;

  if (resolvedId.startsWith('gemini') || resolvedId.includes('gemini')) {
    return new ChatGoogle({
      model: resolvedId,
      apiKey: config.GOOGLE_API_KEY
    });
  } else if (resolvedId.startsWith('mistral') || resolvedId.startsWith('open-mixtral') || resolvedId.includes('mixtral')) {
    return new ChatMistralAI({
      model: resolvedId,
      apiKey: config.MISTRAL_API_KEY
    });
  } else if (resolvedId.startsWith('command')) {
    return new ChatCohere({
      model: resolvedId,
      apiKey: config.COHERE_API_KEY
    });
  } else {
    return geminiModel;
  }
}