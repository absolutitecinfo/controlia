import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();
    
    const body = await req.json();
    const { conversationUuid } = body;

    if (!conversationUuid) {
      return NextResponse.json(
        { error: 'UUID da conversa é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Testando exclusão da conversa:', conversationUuid);

    // 1. Verificar se a conversa existe antes da exclusão
    const { data: conversaAntes, error: fetchError } = await supabase
      .from('conversas')
      .select('id, conversation_uuid, status, titulo')
      .eq('conversation_uuid', conversationUuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (fetchError || !conversaAntes) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    console.log('📋 Conversa antes da exclusão:', conversaAntes);

    // 2. Tentar soft delete primeiro
    const { data: updatedRows, error: updateError } = await supabase
      .from('conversas')
      .update({ status: 'inativa' })
      .eq('conversation_uuid', conversationUuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .select('id, status');

    console.log('🔄 Resultado do soft delete:', { updatedRows, updateError });

    // 3. Se soft delete falhou, tentar hard delete
    if (updateError || !updatedRows || updatedRows.length === 0) {
      console.log('⚠️ Soft delete falhou, tentando hard delete...');
      
      const { error: hardDeleteError } = await supabase
        .from('conversas')
        .delete()
        .eq('conversation_uuid', conversationUuid)
        .eq('empresa_id', profile.empresa_id);

      console.log('🗑️ Resultado do hard delete:', { hardDeleteError });

      if (hardDeleteError) {
        return NextResponse.json(
          { error: 'Erro ao excluir conversa', details: hardDeleteError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        method: 'hard_delete',
        conversaAntes,
        message: 'Conversa removida permanentemente do banco de dados'
      });
    }

    // 4. Verificar se a conversa ainda existe após soft delete
    const { data: conversaDepois, error: checkError } = await supabase
      .from('conversas')
      .select('id, conversation_uuid, status, titulo')
      .eq('conversation_uuid', conversationUuid)
      .eq('user_id', user.id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    console.log('📋 Conversa após soft delete:', conversaDepois);

    return NextResponse.json({ 
      success: true, 
      method: 'soft_delete',
      conversaAntes,
      conversaDepois,
      message: 'Conversa marcada como inativa'
    });

  } catch (error) {
    console.error('❌ Erro no teste de exclusão:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
