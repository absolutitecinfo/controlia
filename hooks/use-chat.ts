import { useState, useRef } from 'react';
import { toast } from 'sonner';

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

  // Lista de agentes disponíveis (hardcoded por enquanto)
  const agents: ChatAgent[] = [
    {
      id: "assistant",
      name: "Assistente Geral",
      description: "Ajuda com tarefas gerais e perguntas diversas",
      icon: null, // Será definido no componente
      color: "text-primary",
      isPopular: true
    },
    {
      id: "developer",
      name: "Desenvolvedor",
      description: "Especialista em programação e desenvolvimento",
      icon: null,
      color: "text-blue-500",
      isPopular: true
    },
    {
      id: "writer",
      name: "Escritor",
      description: "Ajuda com redação e criação de conteúdo",
      icon: null,
      color: "text-green-500",
      isPopular: true
    },
    {
      id: "analyst",
      name: "Analista",
      description: "Análise de dados e relatórios",
      icon: null,
      color: "text-purple-500",
      isPopular: false
    }
  ];

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Se é uma nova conversa, salvar o UUID
      if (data.conversationUuid && !conversationUuid) {
        setConversationUuid(data.conversationUuid);
      }

      // Marcar que a conversa começou
      if (!hasStartedConversation) {
        setHasStartedConversation(true);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      
      // Adicionar mensagem de erro
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Erro: ${errorMessage}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
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

  return {
    messages,
    isLoading,
    selectedAgent,
    conversationUuid,
    hasStartedConversation,
    agents,
    sendMessage,
    startNewConversation,
    clearConversation,
    setSelectedAgent
  };
}
