"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Send, Bot, User, Loader2, Brain, Code, FileText, Zap, ChevronDown, MessageSquare, Settings, BarChart3, Copy, Check, Wrench, Star, ShoppingCart, Shield, Rocket, BookOpen, Briefcase, Cpu, Database, Globe, Lightbulb, Mic, PenTool } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useChat } from "@/hooks/use-chat";
import { usePermissions } from "@/hooks/use-permissions";
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
  const permissions = usePermissions();
  
  const searchParams = useSearchParams();

  const [input, setInput] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [agentsOpen, setAgentsOpen] = useState(true);
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
              {/* Main Input Area - now transparent and borderless */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Saudações e Agentes Populares */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-hero-gradient">
                      {(() => {
                        const fullName = permissions.userName || permissions.userEmail || '';
                        const firstName = fullName.split(' ')[0];
                        return `Olá${firstName ? `, ${firstName}` : '!'}`;
                      })()}
                    </h2>
                    <p className="text-sm text-muted-foreground">ControlIA para sua Empresa</p>
                  </div>
                  {popularAgents.length > 0 && (
                    <div className="pt-2">
                      <div className="mb-3 text-center text-sm font-medium">Agentes Populares</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {popularAgents.map((agent) => {
                          const iconMap: Record<string, any> = {
                            brain: Brain,
                            code: Code,
                            'file-text': FileText,
                            zap: Zap,
                            message: MessageSquare,
                            cart: ShoppingCart,
                            wrench: Wrench,
                            chart: BarChart3,
                            shield: Shield,
                            rocket: Rocket,
                            book: BookOpen,
                            briefcase: Briefcase,
                            cpu: Cpu,
                            db: Database,
                            globe: Globe,
                            idea: Lightbulb,
                            mic: Mic,
                            pen: PenTool,
                            settings: Settings,
                            star: Star,
                          };
                          const IconComponent = iconMap[agent.icon as string] || Brain;
                          return (
                            <Button
                              key={agent.id}
                              variant="outline"
                              className="h-20 flex flex-col items-center justify-center gap-1 px-2 [&_svg]:!size-7"
                              onClick={() => handleAgentSelect(agent.id)}
                            >
                              <IconComponent className="h-7 w-7" style={{ color: agent.color as any }} />
                              <span className="text-sm font-medium leading-none">{agent.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                      placeholder="Insira um comando para o ControlIA"
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

                  {/* Lista de agentes (em Card, abaixo do input) */}
                  <Collapsible open={agentsOpen} onOpenChange={setAgentsOpen}>
                    <div className="flex items-center space-x-2 mb-2">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <ChevronDown className={`h-4 w-4 transition-transform ${agentsOpen ? '' : '-rotate-90'}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <span className="text-sm text-muted-foreground">Escolha um Agente</span>
                    </div>
                    <CollapsibleContent>
                      <Card className="border-border">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Selecione um Agente</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {agents.map((agent) => {
                              const iconMap: Record<string, any> = {
                                brain: Brain,
                                code: Code,
                                'file-text': FileText,
                                zap: Zap,
                                message: MessageSquare,
                                cart: ShoppingCart,
                                wrench: Wrench,
                                chart: BarChart3,
                                shield: Shield,
                                rocket: Rocket,
                                book: BookOpen,
                                briefcase: Briefcase,
                                cpu: Cpu,
                                db: Database,
                                globe: Globe,
                                idea: Lightbulb,
                                mic: Mic,
                                pen: PenTool,
                                settings: Settings,
                                star: Star,
                              };
                              const IconComponent = iconMap[agent.icon as string] || Brain;
                              const active = selectedAgentId === agent.id;
                              return (
                                <Button
                                  key={agent.id}
                                  variant={active ? 'default' : 'outline'}
                                  className="justify-start h-10"
                                  onClick={() => handleAgentSelect(agent.id)}
                                >
                                  <IconComponent className="h-4 w-4 mr-2" style={{ color: agent.color as any }} />
                                  <span className="text-sm">{agent.name}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
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
            
            // Usar o mapeamento de ícones configurado para o agente
            const iconMap: Record<string, any> = {
              brain: Brain,
              code: Code,
              'file-text': FileText,
              zap: Zap,
              message: MessageSquare,
              cart: ShoppingCart,
              wrench: Wrench,
              chart: BarChart3,
              shield: Shield,
              rocket: Rocket,
              book: BookOpen,
              briefcase: Briefcase,
              cpu: Cpu,
              db: Database,
              globe: Globe,
              idea: Lightbulb,
              mic: Mic,
              pen: PenTool,
              settings: Settings,
              star: Star,
            };
            const IconComponent = iconMap[agent.icon as string] || Brain;
            
            return (
              <>
                <IconComponent className="h-6 w-6" style={{ color: agent.color as any }} />
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
                    (() => {
                      const agent = agents.find(a => a.id === selectedAgent);
                      if (!agent) {
                        return (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="h-4 w-4" />
                          </div>
                        );
                      }
                      
                      const iconMap: Record<string, any> = {
                        brain: Brain,
                        code: Code,
                        'file-text': FileText,
                        zap: Zap,
                        message: MessageSquare,
                        cart: ShoppingCart,
                        wrench: Wrench,
                        chart: BarChart3,
                        shield: Shield,
                        rocket: Rocket,
                        book: BookOpen,
                        briefcase: Briefcase,
                        cpu: Cpu,
                        db: Database,
                        globe: Globe,
                        idea: Lightbulb,
                        mic: Mic,
                        pen: PenTool,
                        settings: Settings,
                        star: Star,
                      };
                      const IconComponent = iconMap[agent.icon as string] || Bot;
                      
                      return (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <IconComponent className="h-4 w-4" style={{ color: agent.color as any }} />
                        </div>
                      );
                    })()
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
                {(() => {
                  const agent = agents.find(a => a.id === selectedAgent);
                  if (!agent) {
                    return (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                    );
                  }
                  
                  const iconMap: Record<string, any> = {
                    brain: Brain,
                    code: Code,
                    'file-text': FileText,
                    zap: Zap,
                    message: MessageSquare,
                    cart: ShoppingCart,
                    wrench: Wrench,
                    chart: BarChart3,
                    shield: Shield,
                    rocket: Rocket,
                    book: BookOpen,
                    briefcase: Briefcase,
                    cpu: Cpu,
                    db: Database,
                    globe: Globe,
                    idea: Lightbulb,
                    mic: Mic,
                    pen: PenTool,
                    settings: Settings,
                    star: Star,
                  };
                  const IconComponent = iconMap[agent.icon as string] || Bot;
                  
                  return (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <IconComponent className="h-4 w-4" style={{ color: agent.color as any }} />
                    </div>
                  );
                })()}
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