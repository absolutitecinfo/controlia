import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Agent {
  id: number;
  nome: string;
  descricao: string;
  instrucoes: string;
  icone_url?: string;
  is_active: boolean;
  is_popular: boolean;
  cor?: string;
  created_at: string;
  updated_at: string;
}

export function useAgentes() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar agentes
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agentes');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agentes');
      }
      
      const data = await response.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Criar agente
  const createAgent = async (agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch('/api/agentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar agente');
      }

      const newAgent = await response.json();
      setAgents(prev => [newAgent, ...prev]);
      toast.success('Agente criado com sucesso!');
      return newAgent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Atualizar agente
  const updateAgent = async (id: number, agentData: Partial<Agent>) => {
    try {
      const response = await fetch(`/api/agentes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar agente');
      }

      const updatedAgent = await response.json();
      setAgents(prev => prev.map(agent => 
        agent.id === id ? updatedAgent : agent
      ));
      toast.success('Agente atualizado com sucesso!');
      return updatedAgent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Deletar agente
  const deleteAgent = async (id: number) => {
    try {
      const response = await fetch(`/api/agentes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar agente');
      }

      setAgents(prev => prev.filter(agent => agent.id !== id));
      toast.success('Agente deletado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Buscar agentes na inicialização
  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
  };
}
