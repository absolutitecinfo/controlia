import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkAgentLimit } from '@/lib/limits/track-usage';

export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();

    const { data: agentes, error } = await supabase
      .from('agentes_ia')
      .select('*')
      .eq('empresa_id', profile.empresa_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agentes:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar agentes' },
        { status: 500 }
      );
    }

    return NextResponse.json(agentes);
  } catch (error) {
    console.error('Agentes GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();

    // Check agent limit
    const limitCheck = await checkAgentLimit(profile.empresa_id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: `Limite de agentes atingido. Você pode ter no máximo ${limitCheck.limit} agentes.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { nome, descricao, instrucoes, icone_url, is_active, is_popular, cor } = body;

    if (!nome || !descricao || !instrucoes) {
      return NextResponse.json(
        { error: 'Nome, descrição e instruções são obrigatórios' },
        { status: 400 }
      );
    }

    const { data: agente, error } = await supabase
      .from('agentes_ia')
      .insert({
        empresa_id: profile.empresa_id,
        nome,
        descricao,
        instrucoes,
        icone_url: icone_url || null,
        is_active: is_active ?? true,
        is_popular: is_popular ?? false,
        cor: cor || '#3B82F6',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agente:', error);
      return NextResponse.json(
        { error: 'Erro ao criar agente' },
        { status: 500 }
      );
    }

    return NextResponse.json(agente, { status: 201 });
  } catch (error) {
    console.error('Agentes POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
