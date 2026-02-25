import { completion } from 'litellm';

// This is a placeholder for a more complex LiteLLM integration.
// In a real-world scenario, you would configure this with your full model list,
// API keys from a secure vault, and more detailed routing logic.

export const getLiteLLMResponse = async (prompt: string, model: string = 'gemini/gemini-pro') => {
  try {
    const response = await completion({
      model: model,
      messages: [{ content: prompt, role: 'user' }],
    });
    return response;
  } catch (error) {
    console.error('LiteLLM Error:', error);
    throw new Error('Failed to get response from LiteLLM Gateway.');
  }
};
