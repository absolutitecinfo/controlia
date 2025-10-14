"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Brain, Code, FileText, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  id: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isPopular: boolean;
}

export default function Colaborador() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lista de agentes disponíveis
  const agents: Agent[] = [
    {
      id: "assistant",
      name: "Assistente Geral",
      description: "Ajuda com tarefas gerais e perguntas diversas",
      icon: Brain,
      color: "text-primary",
      isPopular: true
    },
    {
      id: "developer",
      name: "Desenvolvedor",
      description: "Especialista em programação e desenvolvimento",
      icon: Code,
      color: "text-blue-500",
      isPopular: true
    },
    {
      id: "writer",
      name: "Escritor",
      description: "Ajuda com redação e criação de conteúdo",
      icon: FileText,
      color: "text-green-500",
      isPopular: true
    },
    {
      id: "analyst",
      name: "Analista",
      description: "Análise de dados e relatórios",
      icon: Zap,
      color: "text-purple-500",
      isPopular: false
    }
  ];

  // Agentes populares (para botões de acesso rápido)
  const popularAgents = agents.filter(agent => agent.isPopular);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Verifica se um agente foi selecionado
    if (!selectedAgent && !hasStartedConversation) {
      alert("Por favor, selecione um agente antes de iniciar a conversa.");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Marca que a conversa foi iniciada
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
    }

    // Simular resposta da IA
    setTimeout(() => {
      const selectedAgentData = agents.find(agent => agent.id === selectedAgent);
      const agentName = selectedAgentData?.name || "Assistente";
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Olá! Sou o ${agentName}. Como posso ajudá-lo hoje? Esta é uma resposta simulada da IA. Integre com sua API de IA preferida (OpenAI, Claude, etc.) para funcionalidade completa. O sistema está preparado para receber respostas em tempo real.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

        {/* Centralized Input Area */}
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
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-center">Agentes Populares</h3>
                <div className="grid grid-cols-3 gap-3">
                  {popularAgents.map((agent) => {
                    const IconComponent = agent.icon;
                    return (
                      <Button
                        key={agent.id}
                        variant={selectedAgent === agent.id ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col items-center gap-2 transition-smooth ${
                          selectedAgent === agent.id 
                            ? "bg-primary text-primary-foreground shadow-glow-primary" 
                            : "hover:border-primary hover:bg-primary/10 hover:text-foreground"
                        }`}
                        onClick={() => handleAgentSelect(agent.id)}
                      >
                        <IconComponent className={`h-6 w-6 transition-colors ${selectedAgent === agent.id ? "text-primary-foreground" : agent.color}`} />
                        <div className="font-medium text-sm">{agent.name}</div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div className="relative">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Insira um comando para o ControlIA"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[60px] max-h-32 bg-background border-border resize-none focus:ring-2 focus:ring-primary/20 transition-smooth text-base"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary btn-glow-primary transition-smooth h-[60px] px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {/* Tools Section with Agent Selector */}
              <div className="mt-4">
                <button
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth"
                >
                  <div className="h-4 w-4 rounded border border-border flex items-center justify-center">
                    <span className="text-xs">{showAgentSelector ? "−" : "+"}</span>
                  </div>
                  <span className="text-sm">Escolha um Agente</span>
                </button>

                {/* Agent Selector Panel */}
                {showAgentSelector && (
                  <div className="mt-3 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                    <h4 className="text-sm font-medium">Selecione um Agente</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {agents.map((agent) => {
                        const IconComponent = agent.icon;
                        return (
                          <Button
                            key={agent.id}
                            variant={selectedAgent === agent.id ? "default" : "outline"}
                            className={`h-auto p-3 flex items-center gap-2 justify-start transition-smooth ${
                              selectedAgent === agent.id 
                                ? "bg-primary text-primary-foreground shadow-glow-primary" 
                                : "hover:border-primary hover:bg-primary/10 hover:text-foreground"
                            }`}
                            onClick={() => {
                              handleAgentSelect(agent.id);
                              setShowAgentSelector(false);
                            }}
                          >
                            <IconComponent className={`h-4 w-4 transition-colors ${selectedAgent === agent.id ? "text-primary-foreground" : agent.color}`} />
                            <div className="font-medium text-sm">{agent.name}</div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Agent Info */}
                {selectedAgent && (
                  <div className="mt-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const agent = agents.find(a => a.id === selectedAgent);
                        if (!agent) return null;
                        const IconComponent = agent.icon;
                        return (
                          <>
                            <IconComponent className={`h-5 w-5 ${agent.color}`} />
                            <div>
                              <div className="font-medium text-sm">{agent.name}</div>
                              <div className="text-xs text-muted-foreground">{agent.description}</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se já iniciou a conversa, mostra o layout tradicional do chat
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {(() => {
            const agent = agents.find(a => a.id === selectedAgent);
            if (!agent) return null;
            const IconComponent = agent.icon;
            return (
              <>
                <IconComponent className={`h-8 w-8 ${agent.color}`} />
                <div>
                  <h1 className="text-3xl font-bold">{agent.name}</h1>
                  <p className="text-muted-foreground mt-1">
                    {agent.description}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-smooth ${
                  message.role === "user" 
                    ? "bg-primary shadow-glow-primary" 
                    : "bg-muted border border-border"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 space-y-2 ${
                  message.role === "user" ? "text-right" : ""
                }`}>
                  <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted border border-border rounded-bl-md"
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="inline-block rounded-2xl rounded-bl-md bg-muted border border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">IA está pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  placeholder="Digite sua mensagem... (Shift + Enter para nova linha)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[44px] max-h-32 bg-background border-border resize-none focus:ring-2 focus:ring-primary/20 transition-smooth"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary btn-glow-primary transition-smooth h-11 px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pressione Enter para enviar, Shift + Enter para nova linha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

