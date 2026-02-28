import { AIModelProvider, AIModelInterface } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { OllamaProvider } from "./providers/ollama";

export class AIModelFactory {
  static getProvider(provider: AIModelProvider, config: any): AIModelInterface {
    switch (provider) {
      case AIModelProvider.GEMINI:
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY is required for Gemini provider");
        }
        return new GeminiProvider(process.env.GEMINI_API_KEY, config.modelName);
      case AIModelProvider.OLLAMA:
        return new OllamaProvider(config.baseUrl, config.modelName);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
