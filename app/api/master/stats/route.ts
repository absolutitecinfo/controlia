import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();

    // Buscar estatísticas das empresas
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select(`
        id,
        nome,
        status,
        created_at,
        planos (
          id,
          nome,
          preco_mensal
        )
      `);

    if (empresasError) {
      console.error('Error fetching companies:', empresasError);
      return NextResponse.json({ error: 'Erro ao buscar empresas' }, { status: 500 });
    }

    // Buscar estatísticas dos usuários
    const { data: usuarios, error: usuariosError } = await supabase
      .from('perfis')
      .select('id, status, created_at, empresa_id');

    if (usuariosError) {
      console.error('Error fetching users:', usuariosError);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    // Buscar estatísticas dos planos
    const { data: planos, error: planosError } = await supabase
      .from('planos')
      .select('id, nome, preco_mensal, is_active');

    if (planosError) {
      console.error('Error fetching plans:', planosError);
      return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
    }

    // Calcular estatísticas
    const totalEmpresas = empresas.length;
    const empresasAtivas = empresas.filter(e => e.status === 'ativa').length;
    const empresasSuspensas = empresas.filter(e => e.status === 'suspensa').length;
    const empresasInativas = empresas.filter(e => e.status === 'inativa').length;

    const totalUsuarios = usuarios.length;
    const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;
    const usuariosInativos = usuarios.filter(u => u.status === 'inativo').length;

    // Calcular receita mensal
    const receitaMensal = empresas.reduce((total, empresa) => {
      if (empresa.planos && empresa.status === 'ativa') {
        return total + (empresa.planos.preco_mensal || 0);
      }
      return total;
    }, 0);

    // Distribuição por planos
    const distribuicaoPlanos = planos.map(plano => {
      const empresasComPlano = empresas.filter(e => 
        e.planos && e.planos.id === plano.id && e.status === 'ativa'
      ).length;
      
      return {
        id: plano.id,
        nome: plano.nome,
        preco: plano.preco_mensal,
        empresas: empresasComPlano,
        ativo: plano.is_active
      };
    });

    // Empresas recentes (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const empresasRecentes = empresas.filter(e => 
      new Date(e.created_at) >= trintaDiasAtras
    ).length;

    // Taxa de churn (simulada por enquanto)
    const taxaChurn = 3.2; // TODO: Calcular baseado em dados reais

    const stats = {
      empresas: {
        total: totalEmpresas,
        ativas: empresasAtivas,
        suspensas: empresasSuspensas,
        inativas: empresasInativas,
        recentes: empresasRecentes
      },
      usuarios: {
        total: totalUsuarios,
        ativos: usuariosAtivos,
        inativos: usuariosInativos
      },
      financeiro: {
        receitaMensal,
        taxaChurn
      },
      distribuicaoPlanos,
      planos: planos.map(p => ({
        id: p.id,
        nome: p.nome,
        preco: p.preco_mensal,
        ativo: p.is_active
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Master stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
