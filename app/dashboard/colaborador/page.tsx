"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  id: string;
}

export default function Colaborador() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Esta é uma resposta simulada da IA. Integre com sua API de IA preferida (OpenAI, Claude, etc.) para funcionalidade completa. O sistema está preparado para receber respostas em tempo real.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
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
          <h1 className="text-3xl font-bold">Chat com IA</h1>
          <p className="text-muted-foreground mt-2">
            Converse com seu assistente inteligente
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
              
              {/* Tools Section */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 rounded border border-border flex items-center justify-center">
                    <span className="text-xs">+</span>
                  </div>
                  <span className="text-sm">Ferramentas</span>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Suas conversas com ControlIA não são usadas para aprimorar nossos modelos.<br />
                  O ControlIA pode cometer erros. Por isso, é bom checar as respostas.
                </div>
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
        <h1 className="text-3xl font-bold">Chat com IA</h1>
        <p className="text-muted-foreground mt-2">
          Converse com seu assistente inteligente
        </p>
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

