"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, TrendingUp, Activity, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-dashboard";

export default function Dashboard() {
  const { 
    stats, 
    activity, 
    loading, 
    error, 
    fetchAllData,
    formatNumber,
    formatTimestamp,
    getTrendIcon,
    getTrendColor,
    getActivityIcon
  } = useDashboard();

  // Configuração dos cards de estatísticas
  const statsConfig = stats ? [
    {
      title: stats.context.isMaster ? "Total de Usuários (Todas as Empresas)" : "Total de Usuários",
      value: formatNumber(stats.totalUsuarios),
      change: `${stats.tendenciaConversas > 0 ? '+' : ''}${stats.tendenciaConversas.toFixed(1)}%`,
      icon: Users,
      trend: stats.tendenciaConversas
    },
    {
      title: stats.context.isMaster ? "Conversas IA (Todas as Empresas)" : "Conversas IA",
      value: formatNumber(stats.totalConversas),
      change: `${stats.tendenciaConversas > 0 ? '+' : ''}${stats.tendenciaConversas.toFixed(1)}%`,
      icon: MessageSquare,
      trend: stats.tendenciaConversas
    },
    {
      title: "Taxa de Sucesso",
      value: `${stats.taxaSucesso.toFixed(1)}%`,
      change: stats.taxaSucesso > 90 ? "Excelente" : stats.taxaSucesso > 70 ? "Boa" : "Regular",
      icon: TrendingUp,
      trend: stats.taxaSucesso
    },
    {
      title: "Uptime",
      value: `${stats.uptime}%`,
      change: "Estável",
      icon: Activity,
      trend: 0
    }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {stats?.context.isMaster 
              ? 'Visão geral de todas as empresas' 
              : `Visão geral da empresa: ${stats?.context.empresaName}`
            }
          </p>
          {stats?.context.isMaster && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🔑 Acesso Master
              </span>
            </div>
          )}
        </div>
        <Button onClick={fetchAllData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary transition-smooth" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant={stat.trend > 0 ? "default" : stat.trend < 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {getTrendIcon(stat.trend)} {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas interações na plataforma (24h)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade recente
                  </p>
                </div>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 hover:bg-muted/50 p-2 rounded-lg transition-smooth cursor-pointer">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="text-sm">{getActivityIcon(item.icon)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader>
            <CardTitle>
              {stats?.context.isMaster ? 'Resumo da Plataforma' : 'Resumo da Empresa'}
            </CardTitle>
            <CardDescription>
              {stats?.context.isMaster 
                ? 'Informações gerais de todas as empresas' 
                : 'Informações gerais da sua conta'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats && (
                <>
                  <div className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-smooth">
                    <span className="text-sm">
                      {stats.context.isMaster ? "Agentes Ativos (Todas)" : "Agentes Ativos"}
                    </span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {stats.totalAgentes}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-smooth">
                    <span className="text-sm">
                      {stats.context.isMaster ? "Usuários Ativos (7d - Todas)" : "Usuários Ativos (7d)"}
                    </span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {stats.usuariosAtivos}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-smooth">
                    <span className="text-sm">
                      {stats.context.isMaster ? "Total de Mensagens (Todas)" : "Total de Mensagens"}
                    </span>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {formatNumber(stats.totalMensagens)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-smooth">
                    <span className="text-sm">Status da Plataforma</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Operacional
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

