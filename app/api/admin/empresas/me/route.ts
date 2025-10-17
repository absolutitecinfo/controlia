import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  console.log('=== API GET /api/admin/empresas/me called ===');
  try {
    console.log('Calling requireAdmin...');
    const { profile } = await requireAdmin();
    console.log('requireAdmin successful, profile:', profile);
    const supabase = await createServerSupabaseClient();

    const { data: empresa, error } = await supabase
      .from('empresas')
      .select(`
        id,
        nome,
        email,
        chave_api_llm,
        contexto_ia,
        status,
        plano_id,
        planos (
          id,
          nome,
          preco_mensal,
          max_usuarios,
          max_agentes,
          limite_mensagens_mes
        )
      `)
      .eq('id', profile.empresa_id)
      .single();

    if (error) {
      console.error('Error fetching empresa config:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar configurações da empresa' },
        { status: 500 }
      );
    }

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Admin empresa config GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  console.log('=== API PATCH /api/admin/empresas/me called ===');
  try {
    console.log('Calling requireAdmin...');
    const { profile } = await requireAdmin();
    console.log('requireAdmin successful, profile:', profile);
    const supabase = await createServerSupabaseClient();

    const body = await req.json();
    const { chave_api_llm, contexto_ia } = body;

    const updateData: Record<string, unknown> = {};
    
    if (chave_api_llm !== undefined) {
      updateData.chave_api_llm = chave_api_llm;
    }
    
    if (contexto_ia !== undefined) {
      updateData.contexto_ia = contexto_ia;
    }

    const { data: empresa, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', profile.empresa_id)
      .select(`
        id,
        nome,
        email,
        chave_api_llm,
        contexto_ia,
        status,
        plano_id,
        planos (
          id,
          nome,
          preco_mensal,
          max_usuarios,
          max_agentes,
          limite_mensagens_mes
        )
      `)
      .single();

    if (error) {
      console.error('Error updating empresa config:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações da empresa' },
        { status: 500 }
      );
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Admin empresa config PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
