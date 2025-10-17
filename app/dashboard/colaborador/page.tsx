"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Brain, Code, FileText, Zap, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useSearchParams } from "next/navigation";

export default function Colaborador() {
  const {
    messages,
    isLoading,
    selectedAgent,
    hasStartedConversation,
    agents,
    agentsLoading,
    sendMessage,
    startNewConversation,
    clearConversation,
    loadConversation
  } = useChat();
  
  const searchParams = useSearchParams();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Agentes populares (para botões de acesso rápido)
  const popularAgents = agents.filter(agent => agent.isPopular);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar conversa específica se há parâmetro na URL
  useEffect(() => {
    const conversationUuid = searchParams.get('conversation');
    if (conversationUuid && loadConversation) {
      loadConversation(conversationUuid);
    }
  }, [searchParams, loadConversation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedAgent) return;

    await sendMessage(input, selectedAgent);
    setInput("");
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAgentSelect = (agentId: string) => {
    startNewConversation(agentId);
  };

  // Se ainda não iniciou a conversa, mostra a tela centralizada
  if (!hasStartedConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Agentes IA</h1>
          <p className="text-muted-foreground mt-2">
            Escolha um agente especializado para sua conversa
          </p>
        </div>

        {/* Loading State */}
        {agentsLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando agentes...</p>
            </div>
          </div>
        )}

        {/* No Agents State */}
        {!agentsLoading && agents.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agente disponível</h3>
              <p className="text-muted-foreground">
                Entre em contato com o administrador para configurar agentes para sua empresa.
              </p>
            </div>
          </div>
        )}

        {/* Centralized Input Area */}
        {!agentsLoading && agents.length > 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl mx-auto">
              {/* Welcome Message */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-hero-gradient mb-2">
                  Olá!
                </h2>
                <p className="text-muted-foreground text-lg">
                  ControlIA para sua Empresa
                </p>
              </div>

              {/* Agent Selection - Popular Agents Quick Access */}
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Agentes Populares
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {popularAgents.map((agent) => {
                    const IconComponent = agent.id === 'assistant' ? Brain :
                                        agent.id === 'developer' ? Code :
                                        agent.id === 'writer' ? FileText :
                                        agent.id === 'analyst' ? Zap : Bot;
                    
                    return (
                      <Button
                        key={agent.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent"
                        onClick={() => handleAgentSelect(agent.id)}
                      >
                        <IconComponent className={`h-8 w-8 ${agent.color}`} />
                        <div className="text-center">
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {agent.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
                </div>

                {/* All Agents Grid */}
                <div>
                <h3 className="text-lg font-semibold mb-4">Todos os Agentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => {
                    const IconComponent = agent.id === 'assistant' ? Brain :
                                        agent.id === 'developer' ? Code :
                                        agent.id === 'writer' ? FileText :
                                        agent.id === 'analyst' ? Zap : Bot;
                    
                    return (
                      <Button
                        key={agent.id}
                        variant="ghost"
                        className="h-auto p-4 flex items-center space-x-3 justify-start hover:bg-accent"
                        onClick={() => handleAgentSelect(agent.id)}
                      >
                        <IconComponent className={`h-6 w-6 ${agent.color}`} />
                        <div className="text-left">
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {agent.description}
                          </div>
                        </div>
                        {agent.isPopular && (
                          <Star className="h-4 w-4 text-yellow-500 ml-auto" />
                        )}
                      </Button>
                    );
                  })}
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Interface de chat ativa
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          {(() => {
            const agent = agents.find(a => a.id === selectedAgent);
            if (!agent) return null;
            
            const IconComponent = agent.id === 'assistant' ? Brain :
                                agent.id === 'developer' ? Code :
                                agent.id === 'writer' ? FileText :
                                agent.id === 'analyst' ? Zap : Bot;
            
            return (
              <>
                <IconComponent className={`h-6 w-6 ${agent.color}`} />
                <div>
                  <h2 className="font-semibold">{agent.name}</h2>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </>
            );
          })()}
        </div>
        <Button variant="outline" size="sm" onClick={clearConversation}>
          Nova Conversa
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-3 py-2 bg-muted">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Digitando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}