import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();

    // Determinar se é master (pode ver todas as empresas) ou admin/colaborador (apenas sua empresa)
    const isMaster = profile.role === 'master';
    const empresaFilter = isMaster ? {} : { empresa_id: profile.empresa_id };

    // Buscar atividade recente (últimas 24 horas)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // 1. Conversas recentes
    const { data: conversasRecentes } = await supabase
      .from('conversas')
      .select(`
        id,
        conversation_uuid,
        titulo,
        created_at,
        updated_at,
        empresa_id,
        agentes_ia (
          nome
        ),
        empresas (
          nome
        )
      `)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .match(empresaFilter)
      .order('updated_at', { ascending: false })
      .limit(10);

    // 2. Usuários que iniciaram conversas recentemente
    const { data: usuariosRecentes } = await supabase
      .from('perfis')
      .select(`
        id,
        nome_completo,
        created_at,
        role,
        empresa_id,
        empresas (
          nome
        )
      `)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .match(empresaFilter)
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Agentes criados recentemente
    const { data: agentesRecentes } = await supabase
      .from('agentes_ia')
      .select(`
        id,
        nome,
        created_at,
        is_active,
        empresa_id,
        empresas (
          nome
        )
      `)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .match(empresaFilter)
      .order('created_at', { ascending: false })
      .limit(5);

    // Formatar atividade recente
    const activities = [];

    // Adicionar conversas recentes
    conversasRecentes?.forEach(conversa => {
      const empresaInfo = isMaster ? ` (${conversa.empresas?.nome})` : '';
      activities.push({
        id: `conversa-${conversa.id}`,
        type: 'conversation',
        title: 'Nova conversa iniciada',
        description: `"${conversa.titulo}" com ${conversa.agentes_ia?.nome || 'Agente'}${empresaInfo}`,
        timestamp: conversa.created_at,
        icon: 'message-square'
      });
    });

    // Adicionar novos usuários
    usuariosRecentes?.forEach(usuario => {
      const empresaInfo = isMaster ? ` (${usuario.empresas?.nome})` : '';
      activities.push({
        id: `usuario-${usuario.id}`,
        type: 'user',
        title: 'Novo usuário registrado',
        description: `${usuario.nome_completo} (${usuario.role})${empresaInfo}`,
        timestamp: usuario.created_at,
        icon: 'user'
      });
    });

    // Adicionar novos agentes
    agentesRecentes?.forEach(agente => {
      const empresaInfo = isMaster ? ` (${agente.empresas?.nome})` : '';
      activities.push({
        id: `agente-${agente.id}`,
        type: 'agent',
        title: 'Novo agente criado',
        description: `"${agente.nome}" ${agente.is_active ? '(ativo)' : '(inativo)'}${empresaInfo}`,
        timestamp: agente.created_at,
        icon: 'bot'
      });
    });

    // Ordenar por timestamp (mais recente primeiro)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limitar a 10 atividades mais recentes
    const recentActivity = activities.slice(0, 10);

    return NextResponse.json(recentActivity);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
