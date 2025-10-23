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
      console.log('🔍 useConversas - Buscando conversas...');
      
      const response = await fetch('/api/conversas');
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', errData);
        throw new Error(errData.error || 'Erro ao buscar conversas');
      }
      
      const data: Conversa[] = await response.json();
      console.log('✅ Conversas recebidas:', data.length);
      console.log('📋 UUIDs das conversas:', data.map(c => c.uuid));
      setConversas(data);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversa = useCallback(async (conversationUuid: string) => {
    try {
      console.log('🗑️ Excluindo conversa:', conversationUuid);
      
      const response = await fetch(`/api/conversas?uuid=${conversationUuid}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao excluir conversa');
      }
      
      console.log('✅ Conversa excluída no servidor');
      
      // Remover da lista local
      setConversas(prev => {
        const novaLista = prev.filter(conv => conv.uuid !== conversationUuid);
        console.log('📋 Lista após exclusão:', novaLista.length, 'conversas');
        return novaLista;
      });
      
      toast.success('Conversa excluída com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao excluir conversa:', err);
      toast.error(err.message);
      throw err;
    }
  }, []);

  const addConversa = useCallback((novaConversa: Conversa) => {
    console.log('🔄 addConversa chamada com:', novaConversa);
    console.log('🔄 Tipo da conversa:', typeof novaConversa);
    console.log('🔄 UUID da conversa:', novaConversa.uuid);
    
    setConversas(prev => {
      console.log('📋 Lista anterior:', prev.length, 'conversas');
      console.log('📋 UUIDs na lista anterior:', prev.map(c => c.uuid));
      
      // Verificar se a conversa já existe na lista
      const conversaExiste = prev.some(conv => conv.uuid === novaConversa.uuid);
      
      if (conversaExiste) {
        console.log('⚠️ Conversa já existe na lista, não adicionando novamente');
        return prev;
      }
      
      const novaLista = [novaConversa, ...prev];
      console.log('📋 Nova lista:', novaLista.length, 'conversas');
      console.log('📋 UUIDs na nova lista:', novaLista.map(c => c.uuid));
      return novaLista;
    });
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
