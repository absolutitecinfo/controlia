import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface EmpresaConfig {
  chave_api_llm: string;
  contexto_ia: string;
  status: string;
  plano_id: number;
}

export interface Plano {
  id: number;
  nome: string;
  preco_mensal: number;
  max_usuarios: number;
  max_agentes: number;
  limite_mensagens_mes: number;
}

export function useEmpresa() {
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar configurações da empresa
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/empresas/me');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar configurações');
      }
      
      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Buscar planos disponíveis
  const fetchPlanos = async () => {
    try {
      const response = await fetch('/api/planos');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar planos');
      }
      
      const data = await response.json();
      setPlanos(data);
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    }
  };

  // Atualizar configurações
  const updateConfig = async (newConfig: Partial<EmpresaConfig>) => {
    try {
      const response = await fetch('/api/admin/empresas/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar configurações');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      toast.success('Configurações atualizadas com sucesso!');
      return updatedConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Validar chave API
  const validateApiKey = async (apiKey: string) => {
    try {
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chave API inválida');
      }

      const data = await response.json();
      return data.valid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar chave';
      toast.error(errorMessage);
      return false;
    }
  };

  // Buscar configurações na inicialização
  useEffect(() => {
    fetchConfig();
    fetchPlanos();
  }, []);

  return {
    config,
    planos,
    loading,
    error,
    fetchConfig,
    updateConfig,
    validateApiKey,
  };
}
