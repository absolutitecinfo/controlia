import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: planos, error } = await supabase
      .from('planos')
      .select('*')
      .eq('is_active', true)
      .order('preco_mensal', { ascending: true });

    if (error) {
      console.error('Error fetching planos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar planos' },
        { status: 500 }
      );
    }

    return NextResponse.json(planos);
  } catch (error) {
    console.error('Planos GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
