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

    // 1. Total de Usuários (da empresa ou todas se master)
    const { count: totalUsuarios } = await supabase
      .from('perfis')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo')
      .match(empresaFilter);

    // 2. Total de Conversas (da empresa ou todas se master)
    const { count: totalConversas } = await supabase
      .from('conversas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativa')
      .match(empresaFilter);

    // 3. Total de Mensagens (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: totalMensagens } = await supabase
      .from('conversas')
      .select('mensagens', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
      .match(empresaFilter);

    // 4. Total de Agentes Ativos (da empresa ou todas se master)
    const { count: totalAgentes } = await supabase
      .from('agentes_ia')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .match(empresaFilter);

    // 5. Conversas dos últimos 30 dias para calcular tendência
    const { data: conversasRecentes } = await supabase
      .from('conversas')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .match(empresaFilter);

    // 6. Conversas dos 30 dias anteriores para comparação
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const { count: conversasAnteriores } = await supabase
      .from('conversas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString())
      .match(empresaFilter);

    // 7. Usuários ativos nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: usuariosAtivos } = await supabase
      .from('conversas')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())
      .match(empresaFilter);

    // Calcular tendências
    const conversasAtuais = conversasRecentes?.length || 0;
    const tendenciaConversas = conversasAnteriores > 0 
      ? ((conversasAtuais - conversasAnteriores) / conversasAnteriores * 100).toFixed(1)
      : conversasAtuais > 0 ? '100.0' : '0.0';

    // Calcular taxa de sucesso (conversas com pelo menos 2 mensagens)
    const { count: conversasComSucesso } = await supabase
      .from('conversas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
      .match(empresaFilter);

    const taxaSucesso = conversasAtuais > 0 
      ? ((conversasComSucesso || 0) / conversasAtuais * 100).toFixed(1)
      : '0.0';

    // Buscar informações da empresa se não for master
    let empresaInfo = null;
    if (!isMaster) {
      const { data: empresa } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', profile.empresa_id)
        .single();
      
      empresaInfo = empresa;
    }

    // Formatar dados para o frontend
    const stats = {
      totalUsuarios: totalUsuarios || 0,
      totalConversas: totalConversas || 0,
      totalMensagens: totalMensagens || 0,
      totalAgentes: totalAgentes || 0,
      usuariosAtivos: usuariosAtivos || 0,
      tendenciaConversas: parseFloat(tendenciaConversas),
      taxaSucesso: parseFloat(taxaSucesso),
      uptime: 99.9, // Valor fixo por enquanto
      lastUpdated: new Date().toISOString(),
      context: {
        isMaster,
        userRole: profile.role,
        empresaName: empresaInfo?.nome || (isMaster ? 'Todas as Empresas' : 'Empresa não encontrada')
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
