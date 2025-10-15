import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function sendToClaude(
  messages: ClaudeMessage[],
  apiKey: string,
  model: string = 'claude-3-sonnet-20240229'
): Promise<ReadableStream<Uint8Array>> {
  const anthropic = new Anthropic({ apiKey });

  try {
    // Convert messages to Claude format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system') as { role: 'user' | 'assistant'; content: string }[];

    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemMessage?.content || '',
      messages: conversationMessages,
      stream: true,
    });

    // Convert Claude stream to ReadableStream
    const encoder = new TextEncoder();
    
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta') {
              const content = (chunk.delta as { text?: string }).text;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
          }
          controller.close();
        } catch (error) {
          console.error('Claude streaming error:', error);
          controller.error(error);
        }
      },
    });
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Erro na API Claude: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export function detectClaudeProvider(apiKey: string): boolean {
  // Claude keys typically start with 'sk-ant-'
  return apiKey.startsWith('sk-ant-');
}

export function getClaudeModel(_apiKey: string): string {
  // You can implement logic to detect model based on key or other factors
  // For now, default to claude-3-sonnet
  return 'claude-3-sonnet-20240229';
}
