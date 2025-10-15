import OpenAI from 'openai';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function sendToOpenAI(
  messages: OpenAIMessage[],
  apiKey: string,
  model: string = 'gpt-4'
): Promise<ReadableStream<Uint8Array>> {
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    // Convert OpenAI stream to ReadableStream
    const encoder = new TextEncoder();
    
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('OpenAI streaming error:', error);
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Erro na API OpenAI: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export function detectOpenAIProvider(apiKey: string): boolean {
  // OpenAI keys typically start with 'sk-'
  return apiKey.startsWith('sk-');
}

export function getOpenAIModel(_apiKey: string): string {
  // You can implement logic to detect model based on key or other factors
  // For now, default to gpt-4
  return 'gpt-4';
}
