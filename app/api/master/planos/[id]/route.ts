import { NextRequest, NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: plano, error } = await supabase
      .from('planos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching plan:', error);
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    return NextResponse.json(plano);
  } catch (error) {
    console.error('Master plano GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { 
      nome, 
      preco_mensal, 
      limite_usuarios, 
      max_agentes, 
      limite_mensagens_mes, 
      features, 
      is_popular,
      is_active 
    } = await request.json();

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (preco_mensal !== undefined) updateData.preco_mensal = parseFloat(preco_mensal);
    if (limite_usuarios !== undefined) updateData.limite_usuarios = limite_usuarios ? parseInt(limite_usuarios) : null;
    if (max_agentes !== undefined) updateData.max_agentes = max_agentes ? parseInt(max_agentes) : null;
    if (limite_mensagens_mes !== undefined) updateData.limite_mensagens_mes = limite_mensagens_mes ? parseInt(limite_mensagens_mes) : null;
    if (features !== undefined) updateData.features = features;
    if (is_popular !== undefined) updateData.is_popular = is_popular;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('planos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Master plano PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Verificar se o plano está sendo usado por alguma empresa
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id')
      .eq('plano_id', id);

    if (empresasError) {
      console.error('Error checking companies:', empresasError);
      return NextResponse.json({ error: 'Erro ao verificar empresas' }, { status: 500 });
    }

    if (empresas && empresas.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar plano que está sendo usado por empresas' },
        { status: 400 }
      );
    }

    // Deletar plano
    const { error } = await supabase
      .from('planos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting plan:', error);
      return NextResponse.json({ error: 'Erro ao deletar plano' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Plano deletado com sucesso!' });
  } catch (error) {
    console.error('Master plano DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
