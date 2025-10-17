import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Plano {
  id: string;
  nome: string;
  preco_mensal: number;
  limite_usuarios: number | null;
  max_agentes: number | null;
  limite_mensagens_mes: number | null;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanoData {
  nome: string;
  preco_mensal: number;
  limite_usuarios?: number;
  max_agentes?: number;
  limite_mensagens_mes?: number;
  features?: string[];
  is_popular?: boolean;
  is_active?: boolean;
}

export interface UpdatePlanoData {
  nome?: string;
  preco_mensal?: number;
  limite_usuarios?: number;
  max_agentes?: number;
  limite_mensagens_mes?: number;
  features?: string[];
  is_popular?: boolean;
  is_active?: boolean;
}

export function useMasterPlanos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/master/planos');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar planos');
      }
      const data: Plano[] = await response.json();
      setPlanos(data);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Erro ao carregar planos');
      toast.error(err.message || 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanos();
  }, [fetchPlanos]);

  const createPlano = async (newPlanoData: CreatePlanoData) => {
    try {
      const response = await fetch('/api/master/planos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanoData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar plano');
      }
      toast.success('Plano criado com sucesso!');
      fetchPlanos(); // Recarregar lista
    } catch (err: any) {
      console.error('Error creating plan:', err);
      toast.error(err.message || 'Erro ao criar plano');
      throw err;
    }
  };

  const updatePlano = async (id: string, updateData: UpdatePlanoData) => {
    try {
      const response = await fetch(`/api/master/planos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar plano');
      }
      toast.success('Plano atualizado com sucesso!');
      fetchPlanos(); // Recarregar lista
    } catch (err: any) {
      console.error('Error updating plan:', err);
      toast.error(err.message || 'Erro ao atualizar plano');
      throw err;
    }
  };

  const deletePlano = async (id: string) => {
    try {
      const response = await fetch(`/api/master/planos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar plano');
      }
      toast.success('Plano deletado com sucesso!');
      fetchPlanos(); // Recarregar lista
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      toast.error(err.message || 'Erro ao deletar plano');
      throw err;
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await updatePlano(id, { is_active: !currentStatus });
  };

  return {
    planos,
    loading,
    error,
    fetchPlanos,
    createPlano,
    updatePlano,
    deletePlano,
    toggleStatus,
  };
}
