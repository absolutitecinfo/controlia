import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useConversas } from './use-conversas';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatAgent {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  isPopular: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [conversationUuid, setConversationUuid] = useState<string>('');
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [agents, setAgents] = useState<ChatAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  
  // Hook para gerenciar conversas
  const { conversas, addConversa, updateConversa } = useConversas();

  // Buscar agentes da empresa do usuário logado
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setAgentsLoading(true);
        const response = await fetch('/api/agentes');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar agentes');
        }
        
        const agentesData = await response.json();
        
        // Converter dados da API para o formato esperado pelo chat
        const chatAgents: ChatAgent[] = agentesData
          .filter((agente: any) => agente.is_active) // Apenas agentes ativos
          .map((agente: any) => ({
            id: agente.id,
            name: agente.nome,
            description: agente.descricao,
            icon: agente.icone_url || agente.icone || 'brain',
            color: agente.cor || '#3B82F6',
            isPopular: agente.is_popular
          }));
        
        setAgents(chatAgents);
      } catch (error) {
        console.error('Erro ao buscar agentes:', error);
        toast.error('Erro ao carregar agentes');
        
        // Fallback para agentes padrão se houver erro
        setAgents([
          {
            id: "assistant",
            name: "Assistente Geral",
            description: "Ajuda com tarefas gerais e perguntas diversas",
            icon: null,
            color: "text-primary",
            isPopular: true
          }
        ]);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const sendMessage = async (message: string, agentId: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Criar mensagem de assistente vazia para streaming
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          agenteId: agentId,
          conversationUuid: conversationUuid || undefined,
          isNewConversation: !conversationUuid
        }),
      });

      if (!response.ok) {
        // Tentar ler erro como JSON primeiro
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao enviar mensagem');
        } catch (jsonError) {
          // Se não conseguir fazer parse do JSON, usar texto da resposta
          const errorText = await response.text();
          throw new Error(errorText || 'Erro ao enviar mensagem');
        }
      }

      // Verificar se é streaming response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        // Processar streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  
                  if (data.content) {
                    // Atualizar mensagem do assistente com novo conteúdo
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: msg.content + data.content }
                        : msg
                    ));
                  }
                  
                  if (data.done) {
                    // Streaming terminou
                    break;
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError, line);
                }
              }
            }
          }
        }
      } else {
        // Fallback para resposta JSON normal
        const data = await response.json();
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: data.response || data.content || '' }
            : msg
        ));
      }

      // Marcar que a conversa começou
      if (!hasStartedConversation) {
        setHasStartedConversation(true);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      
      // Atualizar mensagem de erro
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: `Erro: ${errorMessage}` }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = (agentId: string) => {
    setSelectedAgent(agentId);
    setMessages([]);
    setConversationUuid('');
    setHasStartedConversation(true);
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationUuid('');
    setHasStartedConversation(false);
    setSelectedAgent('');
  };

  const loadConversation = async (conversationUuid: string) => {
    try {
      // Buscar conversa específica
      const response = await fetch(`/api/conversas/${conversationUuid}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar conversa');
      }
      
      const conversa = await response.json();
      
      // Carregar mensagens da conversa
      const conversaMessages: Message[] = conversa.mensagens?.map((msg: any, index: number) => ({
        id: msg.message_uuid || `msg-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      })) || [];
      
      setMessages(conversaMessages);
      setConversationUuid(conversationUuid);
      setSelectedAgent(conversa.agente_id);
      setHasStartedConversation(true);
      
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      toast.error('Erro ao carregar conversa');
    }
  };

  return {
    messages,
    isLoading,
    selectedAgent,
    conversationUuid,
    hasStartedConversation,
    agents,
    agentsLoading,
    conversas, // Exportar conversas para o componente
    sendMessage,
    startNewConversation,
    clearConversation,
    loadConversation,
    setSelectedAgent
  };
}
