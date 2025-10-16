import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/llm/llm-router';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API é obrigatória' },
        { status: 400 }
      );
    }

    const validation = validateApiKey(apiKey);
    
    return NextResponse.json({
      valid: validation.valid,
      provider: validation.provider,
      error: validation.error
    });
  } catch (error) {
    console.error('Validate API key error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
