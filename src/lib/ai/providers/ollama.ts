import { AIModelInterface, AIAnalysisRequest, AIAnalysisResponse } from "../types";
import { anonymizeText } from "../anonymizer";

export class OllamaProvider implements AIModelInterface {
  private baseUrl: string;
  private modelName: string;

  constructor(baseUrl: string = "http://127.0.0.1:11434", modelName: string = "llava-med") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.modelName = modelName;
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { prompt, patientHistory, anonymize } = request;

    let finalPrompt = prompt;
    if (patientHistory) {
      const history = anonymize ? anonymizeText(patientHistory) : patientHistory;
      finalPrompt = `Patient History: ${history}\n\nQuery: ${prompt}`;
    }

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        prompt: finalPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      text: data.response || "No response from Ollama",
      model: this.modelName,
      isSecure: true, // Local processing
      timestamp: new Date().toISOString(),
    };
  }
}
