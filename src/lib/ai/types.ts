export enum AIModelProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  OLLAMA = 'OLLAMA',
}

export interface AIAnalysisRequest {
  prompt: string;
  patientHistory?: string;
  anonymize?: boolean;
}

export interface AIAnalysisResponse {
  text: string;
  model: string;
  isSecure: boolean;
  timestamp: string;
}

export interface AIModelInterface {
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}
