import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();
    
    const { uuid } = await params;

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID da conversa é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando conversa específica:', uuid);
    console.log('👤 User ID:', user.id);
    console.log('🏢 Empresa ID:', profile.empresa_id);

    // Buscar conversa específica
    const { data: conversa, error } = await supabase
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
      .eq('conversation_uuid', uuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .eq('status', 'ativa')
      .single();

    if (error) {
      console.error('❌ Error fetching conversa:', error);
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    if (!conversa) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Conversa encontrada:', conversa);

    // Formatar dados para o frontend
    const formattedConversa = {
      id: conversa.id,
      uuid: conversa.conversation_uuid,
      titulo: conversa.titulo,
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
    console.error('❌ Conversa GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}