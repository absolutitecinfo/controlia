import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Conversa {
  id: string;
  uuid: string;
  titulo: string;
  agente: {
    id: string;
    nome: string;
    descricao: string;
    cor: string;
  };
  updated_at: string;
  created_at: string;
}

export function useConversas() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/conversas');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao buscar conversas');
      }
      const data: Conversa[] = await response.json();
      setConversas(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversa = useCallback(async (conversationUuid: string) => {
    try {
      const response = await fetch(`/api/conversas?uuid=${conversationUuid}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao excluir conversa');
      }
      
      // Remover da lista local
      setConversas(prev => prev.filter(conv => conv.uuid !== conversationUuid));
      toast.success('Conversa excluída com sucesso!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, []);

  const addConversa = useCallback((novaConversa: Conversa) => {
    setConversas(prev => [novaConversa, ...prev]);
  }, []);

  const updateConversa = useCallback((conversationUuid: string, updates: Partial<Conversa>) => {
    setConversas(prev => 
      prev.map(conv => 
        conv.uuid === conversationUuid 
          ? { ...conv, ...updates, updated_at: new Date().toISOString() }
          : conv
      )
    );
  }, []);

  useEffect(() => {
    fetchConversas();
  }, [fetchConversas]);

  return {
    conversas,
    loading,
    error,
    fetchConversas,
    deleteConversa,
    addConversa,
    updateConversa
  };
}
