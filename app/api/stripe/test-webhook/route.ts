import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { empresa_id, plano_id } = await request.json();

    if (!empresa_id || !plano_id) {
      return NextResponse.json(
        { error: 'empresa_id e plano_id são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Simular atualização do plano (como faria o webhook)
    const { data: empresa, error } = await supabase
      .from('empresas')
      .update({
        plano_id: plano_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', empresa_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar empresa' },
        { status: 500 }
      );
    }

    console.log('Plano atualizado com sucesso:', { empresa_id, plano_id });

    return NextResponse.json({
      message: 'Plano atualizado com sucesso',
      empresa: empresa
    });

  } catch (error) {
    console.error('Erro no test-webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
