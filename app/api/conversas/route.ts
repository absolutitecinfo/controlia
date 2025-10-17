import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();

    // Buscar conversas do usuário com informações do agente
    const { data: conversas, error } = await supabase
      .from('conversas')
      .select(`
        id,
        conversation_uuid,
        titulo,
        status,
        created_at,
        updated_at,
        agentes_ia (
          id,
          nome,
          descricao,
          cor
        )
      `)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .eq('status', 'ativa')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching conversas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conversas' },
        { status: 500 }
      );
    }

    // Formatar dados para o frontend
    const formattedConversas = conversas?.map(conversa => {
      const agente = Array.isArray(conversa.agentes_ia) ? conversa.agentes_ia[0] : conversa.agentes_ia;
      
      return {
        id: conversa.id,
        uuid: conversa.conversation_uuid,
        titulo: conversa.titulo,
        agente: {
          id: agente?.id,
          nome: agente?.nome,
          descricao: agente?.descricao,
          cor: agente?.cor || '#3B82F6'
        },
        updated_at: conversa.updated_at,
        created_at: conversa.created_at
      };
    }) || [];

    return NextResponse.json(formattedConversas);
  } catch (error) {
    console.error('Conversas GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();
    
    const { searchParams } = new URL(req.url);
    const conversationUuid = searchParams.get('uuid');

    if (!conversationUuid) {
      return NextResponse.json(
        { error: 'UUID da conversa é obrigatório' },
        { status: 400 }
      );
    }

    // Marcar conversa como inativa em vez de deletar
    const { error } = await supabase
      .from('conversas')
      .update({ status: 'inativa' })
      .eq('conversation_uuid', conversationUuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id);

    if (error) {
      console.error('Error deleting conversa:', error);
      return NextResponse.json(
        { error: 'Erro ao excluir conversa' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversas DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
