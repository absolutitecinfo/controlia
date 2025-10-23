import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('🔍 /api/conversas - Iniciando...');
    
    const { user, profile } = await requireUser();
    console.log('✅ Usuário autenticado:', { 
      userId: user.id, 
      role: profile.role, 
      empresaId: profile.empresa_id 
    });
    
    const supabase = await createServerSupabaseClient();

    // Verificar se o usuário tem perfil válido
    if (!profile.empresa_id) {
      console.error('❌ Usuário sem empresa_id');
      return NextResponse.json(
        { error: 'Usuário não associado a uma empresa' },
        { status: 403 }
      );
    }

    // Buscar conversas do usuário com informações do agente
    console.log('🔍 Buscando conversas para user_id:', user.id, 'empresa_id:', profile.empresa_id);
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
      console.error('❌ Error fetching conversas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conversas', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Conversas encontradas:', conversas?.length || 0);

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

    console.log('✅ Conversas formatadas:', formattedConversas.length);
    return NextResponse.json(formattedConversas);
  } catch (error) {
    console.error('❌ Conversas GET error:', error);
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

    console.log('🗑️ Excluindo conversa definitivamente:', conversationUuid);
    console.log('👤 User ID:', user.id);
    console.log('🏢 Empresa ID:', profile.empresa_id);

    // Exclusão definitiva (hard delete)
    const { data: deletedData, error: deleteError } = await supabase
      .from('conversas')
      .delete()
      .eq('conversation_uuid', conversationUuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .select('id');

    if (deleteError) {
      console.error('❌ Error deleting conversa:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao excluir conversa', details: deleteError.message },
        { status: 500 }
      );
    }

    if (!deletedData || deletedData.length === 0) {
      console.log('⚠️ Nenhuma conversa foi excluída - pode não existir ou não ter permissão');
      return NextResponse.json(
        { error: 'Conversa não encontrada ou sem permissão para excluir' },
        { status: 404 }
      );
    }

    console.log('✅ Conversa excluída definitivamente:', deletedData);
    return NextResponse.json({ 
      success: true, 
      message: 'Conversa excluída definitivamente',
      deletedCount: deletedData.length
    });
  } catch (error) {
    console.error('Conversas DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
