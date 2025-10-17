"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Check, 
  X, 
  ArrowUp, 
  Calendar, 
  Users, 
  Bot, 
  MessageSquare,
  Loader2,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useEmpresa } from "@/hooks/use-empresa";
import { useStripeBilling } from "@/hooks/use-stripe-billing";

interface Plano {
  id: string;
  nome: string;
  preco_mensal: number;
  max_usuarios: number;
  max_agentes: number;
  limite_mensagens_mes: number;
  features: string[];
  popular?: boolean;
}

interface UsageStats {
  usuarios_atuais: number;
  agentes_atuais: number;
  mensagens_este_mes: number;
}

export default function SubscriptionPage() {
  const { config, planos, loading } = useEmpresa();
  const { loading: billingLoading, createCheckoutSession, openBillingPortal } = useStripeBilling();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      // Buscar estatísticas de uso
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const stats = await response.json();
        setUsageStats({
          usuarios_atuais: stats.totalUsuarios,
          agentes_atuais: stats.totalAgentes,
          mensagens_este_mes: stats.totalMensagens
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUpgrade = async (planoId: string) => {
    try {
      await createCheckoutSession(planoId);
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        toast.error('Erro ao acessar portal de cobrança');
      }
    } catch (error) {
      console.error('Erro ao acessar portal:', error);
      toast.error('Erro ao acessar portal de cobrança');
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0; // Ilimitado
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando informações da assinatura...</p>
        </div>
      </div>
    );
  }

  const currentPlano = config && 'planos' in config ? (config as any).planos : null;
  const availablePlanos = planos.filter(plano => plano.id !== currentPlano?.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seu plano e visualize o uso da plataforma
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plano Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Plano Atual
            </CardTitle>
            <CardDescription>
              Informações sobre sua assinatura atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPlano ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{currentPlano.nome}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Preço mensal</span>
                    <span className="font-semibold">{formatCurrency(currentPlano.preco_mensal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Próxima cobrança</span>
                    <span className="text-sm">-</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleManageBilling}
                    variant="outline" 
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Gerenciar Cobrança
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum plano ativo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uso Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Uso Atual
            </CardTitle>
            <CardDescription>
              Seu consumo de recursos este mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usageStats && currentPlano ? (
              <>
                {/* Usuários */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Usuários</span>
                    </div>
                    <span className="text-sm">
                      {usageStats.usuarios_atuais} / {currentPlano.max_usuarios === 0 ? '∞' : currentPlano.max_usuarios}
                    </span>
                  </div>
                  {currentPlano.max_usuarios > 0 && (
                    <Progress 
                      value={getUsagePercentage(usageStats.usuarios_atuais, currentPlano.max_usuarios)} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Agentes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Agentes IA</span>
                    </div>
                    <span className="text-sm">
                      {usageStats.agentes_atuais} / {currentPlano.max_agentes === 0 ? '∞' : currentPlano.max_agentes}
                    </span>
                  </div>
                  {currentPlano.max_agentes > 0 && (
                    <Progress 
                      value={getUsagePercentage(usageStats.agentes_atuais, currentPlano.max_agentes)} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Mensagens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Mensagens</span>
                    </div>
                    <span className="text-sm">
                      {usageStats.mensagens_este_mes.toLocaleString()} / {!currentPlano.limite_mensagens_mes || currentPlano.limite_mensagens_mes === 0 ? '∞' : currentPlano.limite_mensagens_mes.toLocaleString()}
                    </span>
                  </div>
                  {currentPlano.limite_mensagens_mes && currentPlano.limite_mensagens_mes > 0 && (
                    <Progress 
                      value={getUsagePercentage(usageStats.mensagens_este_mes, currentPlano.limite_mensagens_mes)} 
                      className="h-2"
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Carregando estatísticas...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planos Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade de Plano</CardTitle>
          <CardDescription>
            Escolha o plano que melhor atende às suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePlanos.map((plano) => (
              <Card key={plano.id} className="relative">
                {(plano as any).popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-center">{plano.nome}</CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">{formatCurrency(plano.preco_mensal)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {plano.max_usuarios === 0 ? 'Usuários ilimitados' : `${plano.max_usuarios} usuários`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {plano.max_agentes === 0 ? 'Agentes ilimitados' : `${plano.max_agentes} agentes`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {!plano.limite_mensagens_mes || plano.limite_mensagens_mes === 0 ? 'Mensagens ilimitadas' : `${plano.limite_mensagens_mes.toLocaleString()} mensagens/mês`}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleUpgrade(plano.id.toString())}
                    className="w-full"
                    variant={(plano as any).popular ? "default" : "outline"}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
