import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: agente, error } = await supabase
      .from('agentes_ia')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (error || !agente) {
      return NextResponse.json(
        { error: 'Agente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(agente);
  } catch (error) {
    console.error('Agente GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const body = await req.json();
    const { nome, descricao, instrucoes, icone, icone_url, is_active, is_popular, cor } = body;

    // Build partial update payload (accept partial updates)
    const updateData: any = { updated_at: new Date().toISOString() };
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (instrucoes !== undefined) updateData.instrucoes = instrucoes;
    if (cor !== undefined) updateData.cor = cor;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_popular !== undefined) updateData.is_popular = is_popular;
    // icon can come as 'icone' identifier or legacy 'icone_url'
    if (icone !== undefined) updateData.icone_url = icone;
    if (icone_url !== undefined) updateData.icone_url = icone_url;

    const { data: agente, error } = await supabase
      .from('agentes_ia')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', profile.empresa_id)
      .select()
      .single();

    if (error || !agente) {
      return NextResponse.json(
        { error: 'Erro ao atualizar agente ou agente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(agente);
  } catch (error) {
    console.error('Agente PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Check if agente exists and belongs to empresa
    const { data: agente, error: fetchError } = await supabase
      .from('agentes_ia')
      .select('id')
      .eq('id', id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (fetchError || !agente) {
      return NextResponse.json(
        { error: 'Agente não encontrado' },
        { status: 404 }
      );
    }

    // Check if agente is being used in any conversations
    const { data: conversations } = await supabase
      .from('conversas')
      .select('id')
      .eq('agente_id', id)
      .limit(1);

    if (conversations && conversations.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar um agente que já foi usado em conversas' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('agentes_ia')
      .delete()
      .eq('id', id)
      .eq('empresa_id', profile.empresa_id);

    if (deleteError) {
      console.error('Error deleting agente:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao deletar agente' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Agente deletado com sucesso' });
  } catch (error) {
    console.error('Agente DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
