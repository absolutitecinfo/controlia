import { useState, useEffect, useCallback } from 'react';

export interface MasterStats {
  empresas: {
    total: number;
    ativas: number;
    suspensas: number;
    inativas: number;
    recentes: number;
  };
  usuarios: {
    total: number;
    ativos: number;
    inativos: number;
  };
  financeiro: {
    receitaMensal: number;
    taxaChurn: number;
  };
  distribuicaoPlanos: Array<{
    id: string;
    nome: string;
    preco: number;
    empresas: number;
    ativo: boolean;
  }>;
  planos: Array<{
    id: string;
    nome: string;
    preco: number;
    ativo: boolean;
  }>;
}

export function useMasterStats() {
  const [stats, setStats] = useState<MasterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/master/stats');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar estatísticas');
      }
      const data: MasterStats = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching master stats:', err);
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}
