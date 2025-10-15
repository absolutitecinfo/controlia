import { sendToOpenAI, detectOpenAIProvider, getOpenAIModel } from './openai-service';
import { sendToClaude, detectClaudeProvider, getClaudeModel } from './claude-service';

export type LLMProvider = 'openai' | 'claude';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  provider: LLMProvider;
  model: string;
  stream: ReadableStream<Uint8Array>;
}

export function detectProvider(apiKey: string): LLMProvider {
  if (detectOpenAIProvider(apiKey)) {
    return 'openai';
  } else if (detectClaudeProvider(apiKey)) {
    return 'claude';
  } else {
    throw new Error('Chave API não reconhecida. Suportamos OpenAI (sk-...) e Claude (sk-ant-...)');
  }
}

export async function routeToLLM(
  apiKey: string,
  messages: LLMMessage[],
  preferredProvider?: LLMProvider
): Promise<LLMResponse> {
  const provider = preferredProvider || detectProvider(apiKey);
  
  switch (provider) {
    case 'openai': {
      const model = getOpenAIModel(apiKey);
      const stream = await sendToOpenAI(messages, apiKey, model);
      return {
        provider: 'openai',
        model,
        stream,
      };
    }
    
    case 'claude': {
      const model = getClaudeModel(apiKey);
      const stream = await sendToClaude(messages, apiKey, model);
      return {
        provider: 'claude',
        model,
        stream,
      };
    }
    
    default:
      throw new Error(`Provider não suportado: ${provider}`);
  }
}

export function validateApiKey(apiKey: string): { valid: boolean; provider?: LLMProvider; error?: string } {
  try {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, error: 'Chave API não fornecida' };
    }

    const provider = detectProvider(apiKey);
    return { valid: true, provider };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Chave API inválida' 
    };
  }
}
