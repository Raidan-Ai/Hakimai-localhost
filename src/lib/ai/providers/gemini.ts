import { GoogleGenAI } from "@google/genai";
import { AIModelInterface, AIAnalysisRequest, AIAnalysisResponse } from "../types";
import { anonymizeText } from "../anonymizer";

export class GeminiProvider implements AIModelInterface {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = "gemini-3-flash-preview") {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { prompt, patientHistory, anonymize } = request;

    let finalPrompt = prompt;
    if (patientHistory) {
      const history = anonymize ? anonymizeText(patientHistory) : patientHistory;
      finalPrompt = `Patient History: ${history}\n\nQuery: ${prompt}`;
    }

    const response = await this.client.models.generateContent({
      model: this.modelName,
      contents: finalPrompt,
    });

    return {
      text: response.text || "No response from Gemini",
      model: this.modelName,
      isSecure: false, // Cloud processing
      timestamp: new Date().toISOString(),
    };
  }
}
