import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type AIProvider = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL_EDGE';

export interface AIConfig {
  aiMode: string;
  activeCloud: string;
  ollamaUrl: string;
}

/**
 * Hybrid AI Provider Switch
 * Routes inference to local or cloud providers based on system configuration.
 */
export async function getAIResponse(prompt: string, config: AIConfig) {
  const { aiMode, activeCloud, ollamaUrl } = config;

  // 1. Route to Local Edge if configured
  if (aiMode === 'LOCAL_EDGE') {
    return callLocalOllama(prompt, ollamaUrl);
  }

  // 2. Route to Cloud Provider
  switch (activeCloud) {
    case 'GEMINI':
      return callGemini(prompt);
    case 'OPENAI':
      return callOpenAI(prompt);
    case 'ANTHROPIC':
      return callAnthropic(prompt);
    default:
      return callGemini(prompt);
  }
}

async function callLocalOllama(prompt: string, url: string) {
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: 'llava-med:latest', // Default local model
        prompt,
        stream: false
      }),
    });
    const data = await response.json();
    return { text: data.response, model: 'Ollama (Local Edge)' };
  } catch (error) {
    throw new Error('Local AI failed. Ensure Ollama is running.');
  }
}

async function callGemini(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return { text: response.text, model: 'Gemini Cloud' };
}

async function callOpenAI(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  return { text: response.choices[0].message.content, model: 'OpenAI Cloud' };
}

async function callAnthropic(prompt: string) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  // Anthropic response structure is different
  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return { text, model: 'Anthropic Cloud' };
}
