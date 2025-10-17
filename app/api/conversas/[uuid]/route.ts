import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();

    // Buscar conversa específica com mensagens e informações do agente
    const { data: conversa, error } = await supabase
      .from('conversas')
      .select(`
        id,
        conversation_uuid,
        titulo,
        status,
        mensagens,
        created_at,
        updated_at,
        agente_id,
        agentes_ia (
          id,
          nome,
          descricao,
          cor
        )
      `)
      .eq('conversation_uuid', uuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (error || !conversa) {
      console.error('Error fetching conversa:', error);
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Formatar dados para o frontend
    const formattedConversa = {
      id: conversa.id,
      uuid: conversa.conversation_uuid,
      titulo: conversa.titulo,
      mensagens: conversa.mensagens || [],
      agente_id: conversa.agente_id,
      agente: {
        id: conversa.agentes_ia?.id,
        nome: conversa.agentes_ia?.nome,
        descricao: conversa.agentes_ia?.descricao,
        cor: conversa.agentes_ia?.cor || '#3B82F6'
      },
      updated_at: conversa.updated_at,
      created_at: conversa.created_at
    };

    return NextResponse.json(formattedConversa);
  } catch (error) {
    console.error('Conversa GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
