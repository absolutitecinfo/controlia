"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Loader2, Brain, Code, FileText, Zap, Star, ChevronDown, MessageSquare, Settings, BarChart3, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useChat } from "@/hooks/use-chat";
import { useSearchParams } from "next/navigation";

function ColaboradorContent() {
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
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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

  // Focar no campo de texto quando o agente termina de responder
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // Verifica se a última mensagem é do agente (não do usuário)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && textareaRef.current) {
        // Pequeno delay para garantir que a UI foi atualizada
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [isLoading, messages]);

  // Carregar conversa específica se há parâmetro na URL
  useEffect(() => {
    const conversationUuid = searchParams.get('conversation');
    if (conversationUuid && loadConversation) {
      loadConversation(conversationUuid);
    }
  }, [searchParams, loadConversation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Se não há agente selecionado, seleciona o primeiro agente disponível
    let agentToUse = selectedAgentId;
    if (!agentToUse && agents.length > 0) {
      agentToUse = agents[0].id;
    }

    if (!agentToUse) return;

    // Inicia a conversa com o agente selecionado
    if (!selectedAgent || selectedAgent !== agentToUse) {
      startNewConversation(agentToUse);
    }

    await sendMessage(input, agentToUse);
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
    setSelectedAgentId(agentId);
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      
      // Reset após 2 segundos
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar mensagem:', error);
    }
  };

  // Se ainda não iniciou a conversa, mostra a tela centralizada estilo Cursor
  if (!hasStartedConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
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

        {/* Cursor-style Interface */}
        {!agentsLoading && agents.length > 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto px-4">
              {/* Main Input Area */}
              <div className="bg-card border rounded-lg p-6 shadow-lg">
                <div className="space-y-4">
                  {/* Agent Selection Dropdown */}
                  <div className="flex items-center space-x-3">
                    <Select value={selectedAgentId || ""} onValueChange={handleAgentSelect}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Selecione um agente" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => {
                          const IconComponent = agent.id === 'assistant' ? Brain :
                                              agent.id === 'developer' ? Code :
                                              agent.id === 'writer' ? FileText :
                                              agent.id === 'analyst' ? Zap : Bot;
                          
                          return (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className={`h-4 w-4 ${agent.color}`} />
                                <span>{agent.name}</span>
                                {agent.isPopular && <Star className="h-3 w-3 text-yellow-500" />}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">
                      {selectedAgentId ? (
                        <span className="flex items-center">
                          <Bot className="h-4 w-4 mr-1" />
                          Agente selecionado - {agents.find(a => a.id === selectedAgentId)?.name}
                        </span>
                      ) : (
                        "Digite sua mensagem ou selecione um agente específico"
                      )}
                    </div>
                  </div>

                  {/* Main Input Field */}
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Pergunte ao ControlIA para construir, corrigir bugs, explorar..."
                      className="min-h-[120px] max-h-[300px] resize-none text-lg border-2 focus:border-primary/50"
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Access Buttons */}
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-3">Tente estes exemplos para começar:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex items-center space-x-2 justify-start hover:bg-accent"
                        onClick={() => {
                          setInput("Escreva documentação para o projeto");
                          setTimeout(() => handleSend(), 100);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Escrever documentação</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex items-center space-x-2 justify-start hover:bg-accent"
                        onClick={() => {
                          setInput("Otimize a performance do código");
                          setTimeout(() => handleSend(), 100);
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Otimizar performance</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex items-center space-x-2 justify-start hover:bg-accent"
                        onClick={() => {
                          setInput("Encontre e corrija 3 bugs");
                          setTimeout(() => handleSend(), 100);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Encontrar e corrigir bugs</span>
                      </Button>
                    </div>
                  </div>

                  {/* Popular Agents Quick Access */}
                  {popularAgents.length > 0 && (
                    <div className="pt-6 border-t">
                      <div className="flex items-center space-x-2 mb-3">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Agentes Populares</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularAgents.map((agent) => {
                          const IconComponent = agent.id === 'assistant' ? Brain :
                                              agent.id === 'developer' ? Code :
                                              agent.id === 'writer' ? FileText :
                                              agent.id === 'analyst' ? Zap : Bot;
                          
                          return (
                            <Button
                              key={agent.id}
                              variant="secondary"
                              size="sm"
                              className="h-8 flex items-center space-x-2"
                              onClick={() => handleAgentSelect(agent.id)}
                            >
                              <IconComponent className={`h-3 w-3 ${agent.color}`} />
                              <span className="text-xs">{agent.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                  className={`rounded-lg px-3 py-2 relative group ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap pr-8">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyMessage(message.id, message.content)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
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

export default function Colaborador() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <ColaboradorContent />
    </Suspense>
  );
}