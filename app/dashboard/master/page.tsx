"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  CreditCard,
  Plus,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMasterStats } from "@/hooks/use-master-stats";
import { useMasterEmpresas, Empresa } from "@/hooks/use-master-empresas";
import { useMasterPlanos, Plano } from "@/hooks/use-master-planos";
import { useStripeSync } from "@/hooks/use-stripe-sync";

// Interfaces para formulários
interface CreateEmpresaForm {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  plano_id: string;
}

interface CreatePlanoForm {
  nome: string;
  preco_mensal: string;
  limite_usuarios: string;
  max_agentes: string;
  limite_mensagens_mes: string;
  features: string[];
  is_popular: boolean;
}

function MasterContent() {
  // Hooks para dados reais
  const { stats, loading: statsLoading, error: statsError } = useMasterStats();
  const { 
    empresas, 
    loading: empresasLoading, 
    error: empresasError,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    toggleStatus: toggleEmpresaStatus
  } = useMasterEmpresas();
  const { 
    planos, 
    loading: planosLoading, 
    error: planosError,
    createPlano,
    updatePlano,
    deletePlano,
    toggleStatus: togglePlanoStatus
  } = useMasterPlanos();
  const { syncing, results, syncPlans } = useStripeSync();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [isEmpresaDialogOpen, setIsEmpresaDialogOpen] = useState(false);
  const [isPlanoDialogOpen, setIsPlanoDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [isCreateEmpresaOpen, setIsCreateEmpresaOpen] = useState(false);
  const [isCreatePlanoOpen, setIsCreatePlanoOpen] = useState(false);
  const [empresaForm, setEmpresaForm] = useState<CreateEmpresaForm>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    plano_id: ''
  });
  const [planoForm, setPlanoForm] = useState<CreatePlanoForm>({
    nome: '',
    preco_mensal: '',
    limite_usuarios: '',
    max_agentes: '',
    limite_mensagens_mes: '',
    features: [],
    is_popular: false
  });
  const [editingPlanoForm, setEditingPlanoForm] = useState<CreatePlanoForm>({
    nome: '',
    preco_mensal: '',
    limite_usuarios: '',
    max_agentes: '',
    limite_mensagens_mes: '',
    features: [],
    is_popular: false
  });

  // Filtrar empresas
  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || empresa.status === statusFilter;
    const matchesPlan = planFilter === "all" || empresa.plano.id === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleEmpresaAction = async (empresa: Empresa, action: string) => {
    try {
      switch (action) {
        case 'suspend':
          await updateEmpresa(empresa.id, { status: 'suspensa' });
          break;
        case 'activate':
          await updateEmpresa(empresa.id, { status: 'ativa' });
          break;
        case 'ban':
          await updateEmpresa(empresa.id, { status: 'inativa' });
          break;
        case 'delete':
          await deleteEmpresa(empresa.id);
          break;
      }
    } catch (error) {
      console.error(`Error ${action} empresa:`, error);
    }
  };

  const handlePlanoToggle = async (plano: Plano) => {
    try {
      await togglePlanoStatus(plano.id, plano.is_active);
    } catch (error) {
      console.error('Error toggling plano:', error);
    }
  };

  const handleCreateEmpresa = async () => {
    try {
      await createEmpresa(empresaForm);
      setIsCreateEmpresaOpen(false);
      setEmpresaForm({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        plano_id: ''
      });
    } catch (error) {
      console.error('Error creating empresa:', error);
    }
  };

  const handleCreatePlano = async () => {
    try {
      await createPlano({
        nome: planoForm.nome,
        preco_mensal: parseFloat(planoForm.preco_mensal),
        limite_usuarios: planoForm.limite_usuarios ? parseInt(planoForm.limite_usuarios) : undefined,
        max_agentes: planoForm.max_agentes ? parseInt(planoForm.max_agentes) : undefined,
        limite_mensagens_mes: planoForm.limite_mensagens_mes ? parseInt(planoForm.limite_mensagens_mes) : undefined,
        features: planoForm.features,
        is_popular: planoForm.is_popular
      });
      setIsCreatePlanoOpen(false);
      setPlanoForm({
        nome: '',
        preco_mensal: '',
        limite_usuarios: '',
        max_agentes: '',
        limite_mensagens_mes: '',
        features: [],
        is_popular: false
      });
    } catch (error) {
      console.error('Error creating plano:', error);
    }
  };

  const handleEditPlano = async () => {
    if (!editingPlano) return;
    
    try {
      await updatePlano(editingPlano.id, {
        nome: editingPlanoForm.nome,
        preco_mensal: parseFloat(editingPlanoForm.preco_mensal),
        limite_usuarios: editingPlanoForm.limite_usuarios ? parseInt(editingPlanoForm.limite_usuarios) : undefined,
        max_agentes: editingPlanoForm.max_agentes ? parseInt(editingPlanoForm.max_agentes) : undefined,
        limite_mensagens_mes: editingPlanoForm.limite_mensagens_mes ? parseInt(editingPlanoForm.limite_mensagens_mes) : undefined,
        features: editingPlanoForm.features,
        is_popular: editingPlanoForm.is_popular
      });
      setIsPlanoDialogOpen(false);
      setEditingPlano(null);
      setEditingPlanoForm({
        nome: '',
        preco_mensal: '',
        limite_usuarios: '',
        max_agentes: '',
        limite_mensagens_mes: '',
        features: [],
        is_popular: false
      });
    } catch (error) {
      console.error('Error updating plano:', error);
    }
  };

  const openEditPlanoDialog = (plano: Plano) => {
    setEditingPlano(plano);
    setEditingPlanoForm({
      nome: plano.nome,
      preco_mensal: plano.preco_mensal.toString(),
      limite_usuarios: plano.limite_usuarios?.toString() || '',
      max_agentes: plano.max_agentes?.toString() || '',
      limite_mensagens_mes: plano.limite_mensagens_mes?.toString() || '',
      features: plano.features,
      is_popular: plano.is_popular
    });
    setIsPlanoDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "ativa": "default",
      "suspensa": "secondary", 
      "inativa": "destructive"
    } as const;
    
    const icons = {
      "ativa": <CheckCircle className="h-3 w-3" />,
      "suspensa": <AlertTriangle className="h-3 w-3" />,
      "inativa": <Ban className="h-3 w-3" />
    };

    const labels = {
      "ativa": "Ativa",
      "suspensa": "Suspensa",
      "inativa": "Inativa"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPlanBadge = (plano: { nome: string; preco_mensal: number }) => {
    const colors = {
      "Free": "bg-green-600",
      "Básico": "bg-teal-500",
      "Empresa": "bg-yellow-500", 
      "Master": "bg-gray-500"
    };
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${colors[plano.nome as keyof typeof colors] || 'bg-gray-400'}`} />
        {plano.nome}
      </Badge>
    );
  };

  // Loading state
  if (statsLoading || empresasLoading || planosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados da plataforma...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || empresasError || planosError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground mt-2">
            {statsError || empresasError || planosError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Administração da Plataforma</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciamento completo de planos, clientes e operações da ControlIA
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.empresas.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.empresas.ativas || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats?.financeiro.receitaMensal.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-2">
              +12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Suspensas</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.empresas.suspensas || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Requer atenção
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.financeiro.taxaChurn || 0}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              -0.8% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Planos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats?.distribuicaoPlanos.map((plano) => (
          <Card key={plano.id} className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  plano.nome === 'Free' ? 'bg-green-600' :
                  plano.nome === 'Básico' ? 'bg-teal-500' :
                  plano.nome === 'Empresa' ? 'bg-yellow-500' :
                  plano.nome === 'Master' ? 'bg-gray-500' :
                  'bg-gray-400'
                }`} />
                {plano.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plano.empresas}</div>
              <p className="text-sm text-muted-foreground">empresas</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Gerenciamento */}
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="companies" className="data-[state=active]:text-primary">
            Gerenciar Clientes
          </TabsTrigger>
          <TabsTrigger value="plans" className="data-[state=active]:text-primary">
            Gerenciar Planos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Gerenciar Clientes */}
        <TabsContent value="companies" className="space-y-6">
          <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Empresas</CardTitle>
                  <CardDescription>
                    Gerencie todas as empresas e suas assinaturas
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button onClick={() => setIsCreateEmpresaOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEmpresas.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{empresa.nome}</h3>
                        <p className="text-sm text-muted-foreground">{empresa.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getPlanBadge(empresa.plano)}
                          {getStatusBadge(empresa.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
                        {empresa.plano.preco_mensal === 0 ? "Grátis" : `R$ ${empresa.plano.preco_mensal.toFixed(2)}/mês`}
                      </p>
                      <p className="text-sm text-muted-foreground">{empresa.usuariosCount} usuários</p>
                      <p className="text-xs text-muted-foreground">
                        {empresa.usuariosAtivos} ativos
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmpresa(empresa);
                          setIsEmpresaDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEmpresaAction(empresa, "edit")}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {empresa.status === "ativa" ? (
                          <DropdownMenuItem 
                            onClick={() => handleEmpresaAction(empresa, "suspend")}
                            className="text-yellow-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleEmpresaAction(empresa, "activate")}
                            className="text-green-600"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleEmpresaAction(empresa, "ban")}
                          className="text-red-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Banir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gerenciar Planos */}
        <TabsContent value="plans" className="space-y-6">
          <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Planos de Assinatura</CardTitle>
                  <CardDescription>
                    Configure e gerencie os planos disponíveis
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={syncPlans}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Sincronizar com Stripe
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/test-user', {
                          credentials: 'include'
                        });
                        const data = await response.json();
                        console.log('Test user response:', data);
                        alert(`Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
                      } catch (error) {
                        console.error('Test user error:', error);
                        alert(`Error: ${error}`);
                      }
                    }}
                  >
                    Testar Auth
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe/products', {
                          credentials: 'include'
                        });
                        const data = await response.json();
                        console.log('Stripe products:', data);
                        alert(`Produtos no Stripe: ${data.products.length}\n${JSON.stringify(data.products.map((p: any) => p.name), null, 2)}`);
                      } catch (error) {
                        console.error('Stripe products error:', error);
                        alert(`Error: ${error}`);
                      }
                    }}
                  >
                    Listar Produtos
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      const empresa_id = prompt('Digite o ID da empresa:');
                      const plano_id = prompt('Digite o ID do novo plano:');
                      
                      if (!empresa_id || !plano_id) {
                        alert('ID da empresa e plano são obrigatórios!');
                        return;
                      }
                      
                      try {
                        const response = await fetch('/api/stripe/test-webhook', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({ empresa_id: parseInt(empresa_id), plano_id: parseInt(plano_id) })
                        });
                        const data = await response.json();
                        console.log('Test webhook response:', data);
                        alert(`Status: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                      } catch (error) {
                        console.error('Test webhook error:', error);
                        alert(`Error: ${error}`);
                      }
                    }}
                  >
                    Testar Webhook
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={async () => {
                      if (confirm('Tem certeza? Isso vai limpar todos os IDs do Stripe e permitir recriar os produtos.')) {
                        try {
                          const response = await fetch('/api/stripe/clear-ids', {
                            method: 'POST',
                            credentials: 'include'
                          });
                          const data = await response.json();
                          console.log('Clear IDs response:', data);
                          alert(data.message || 'IDs limpos com sucesso!');
                        } catch (error) {
                          console.error('Clear IDs error:', error);
                          alert(`Error: ${error}`);
                        }
                      }
                    }}
                  >
                    Limpar IDs
                  </Button>
                  <Button onClick={() => setIsCreatePlanoOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Plano
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {planos.map((plano) => (
                  <Card key={plano.id} className="border-border hover:border-primary transition-smooth">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${
                            plano.nome === 'Free' ? 'bg-green-600' :
                            plano.nome === 'Básico' ? 'bg-teal-500' :
                            plano.nome === 'Empresa' ? 'bg-yellow-500' :
                            plano.nome === 'Master' ? 'bg-gray-500' :
                            'bg-gray-400'
                          }`} />
                          {plano.nome}
                          {plano.stripe_product_id && (
                            <Badge variant="outline" className="text-xs">
                              <CreditCard className="h-3 w-3 mr-1" />
                              Stripe
                            </Badge>
                          )}
                        </CardTitle>
                        <Switch
                          checked={plano.is_active}
                          onCheckedChange={() => handlePlanoToggle(plano)}
                        />
                      </div>
                      <CardDescription>
                        {plano.limite_usuarios ? `Até ${plano.limite_usuarios} usuários` : 'Usuários ilimitados'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">
                        {plano.preco_mensal === 0 ? (
                          <span>Grátis</span>
                        ) : (
                          <>
                            R$ {plano.preco_mensal.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                          </>
                        )}
                      </div>
                      <ul className="space-y-2 mb-4">
                        {plano.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openEditPlanoDialog(plano)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deletePlano(plano.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes da Empresa */}
      <Dialog open={isEmpresaDialogOpen} onOpenChange={setIsEmpresaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
            <DialogDescription>
              Informações completas e histórico de ações
            </DialogDescription>
          </DialogHeader>
          {selectedEmpresa && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Nome da Empresa</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmpresa.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmpresa.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmpresa.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Endereço</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmpresa.endereco || 'Não informado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plano Atual</Label>
                  <div className="mt-1">{getPlanBadge(selectedEmpresa.plano)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEmpresa.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Usuários</Label>
                  <p className="text-sm text-muted-foreground">{selectedEmpresa.usuariosCount} usuários ({selectedEmpresa.usuariosAtivos} ativos)</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Receita Mensal</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmpresa.plano.preco_mensal === 0 ? 'Grátis' : `R$ ${selectedEmpresa.plano.preco_mensal.toFixed(2)}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Adesão</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEmpresa.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Atualização</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEmpresa.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Empresa
                </Button>
                <Button variant="outline" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Alterar Plano
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleEmpresaAction(selectedEmpresa, 'ban')}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Banir Empresa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação de Empresa */}
      <Dialog open={isCreateEmpresaOpen} onOpenChange={setIsCreateEmpresaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Adicione uma nova empresa à plataforma
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="empresa-nome">Nome da Empresa</Label>
              <Input 
                id="empresa-nome" 
                placeholder="Ex: TechCorp Solutions"
                value={empresaForm.nome}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="empresa-email">Email</Label>
              <Input 
                id="empresa-email" 
                type="email"
                placeholder="contato@empresa.com"
                value={empresaForm.email}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="empresa-telefone">Telefone</Label>
              <Input 
                id="empresa-telefone" 
                placeholder="(11) 99999-9999"
                value={empresaForm.telefone}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, telefone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="empresa-endereco">Endereço</Label>
              <Input 
                id="empresa-endereco" 
                placeholder="São Paulo, SP"
                value={empresaForm.endereco}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, endereco: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="empresa-plano">Plano</Label>
              <select
                id="empresa-plano"
                value={empresaForm.plano_id}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, plano_id: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Selecione um plano</option>
                {planos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome} - R$ {plano.preco_mensal.toFixed(2)}/mês
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleCreateEmpresa}>
                Criar Empresa
              </Button>
              <Button variant="outline" onClick={() => setIsCreateEmpresaOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação de Plano */}
      <Dialog open={isCreatePlanoOpen} onOpenChange={setIsCreatePlanoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Plano</DialogTitle>
            <DialogDescription>
              Configure os detalhes do novo plano de assinatura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plano-nome">Nome do Plano</Label>
              <Input 
                id="plano-nome" 
                placeholder="Ex: Básico, Empresa, Master"
                value={planoForm.nome}
                onChange={(e) => setPlanoForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="plano-preco">Preço Mensal (R$)</Label>
              <Input 
                id="plano-preco" 
                type="number" 
                step="0.01"
                placeholder="49.90"
                value={planoForm.preco_mensal}
                onChange={(e) => setPlanoForm(prev => ({ ...prev, preco_mensal: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="plano-usuarios">Máximo de Usuários (0 = ilimitado)</Label>
              <Input 
                id="plano-usuarios" 
                type="number" 
                placeholder="10"
                value={planoForm.limite_usuarios}
                onChange={(e) => setPlanoForm(prev => ({ ...prev, limite_usuarios: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="plano-agentes">Máximo de Agentes (0 = ilimitado)</Label>
              <Input 
                id="plano-agentes" 
                type="number" 
                placeholder="5"
                value={planoForm.max_agentes}
                onChange={(e) => setPlanoForm(prev => ({ ...prev, max_agentes: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="plano-mensagens">Limite de Mensagens/Mês (0 = ilimitado)</Label>
              <Input 
                id="plano-mensagens" 
                type="number" 
                placeholder="1000"
                value={planoForm.limite_mensagens_mes}
                onChange={(e) => setPlanoForm(prev => ({ ...prev, limite_mensagens_mes: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="plano-popular" 
                checked={planoForm.is_popular}
                onCheckedChange={(checked) => setPlanoForm(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label htmlFor="plano-popular">Plano Popular</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleCreatePlano}>
                Criar Plano
              </Button>
              <Button variant="outline" onClick={() => setIsCreatePlanoOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Plano */}
      <Dialog open={isPlanoDialogOpen} onOpenChange={setIsPlanoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do plano de assinatura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-plano-nome">Nome do Plano</Label>
              <Input 
                id="edit-plano-nome" 
                placeholder="Ex: Básico, Empresa, Master"
                value={editingPlanoForm.nome}
                onChange={(e) => setEditingPlanoForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-plano-preco">Preço Mensal (R$)</Label>
              <Input 
                id="edit-plano-preco" 
                type="number" 
                step="0.01"
                placeholder="49.90"
                value={editingPlanoForm.preco_mensal}
                onChange={(e) => setEditingPlanoForm(prev => ({ ...prev, preco_mensal: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-plano-usuarios">Máximo de Usuários (0 = ilimitado)</Label>
              <Input 
                id="edit-plano-usuarios" 
                type="number" 
                placeholder="10"
                value={editingPlanoForm.limite_usuarios}
                onChange={(e) => setEditingPlanoForm(prev => ({ ...prev, limite_usuarios: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-plano-agentes">Máximo de Agentes (0 = ilimitado)</Label>
              <Input 
                id="edit-plano-agentes" 
                type="number" 
                placeholder="5"
                value={editingPlanoForm.max_agentes}
                onChange={(e) => setEditingPlanoForm(prev => ({ ...prev, max_agentes: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-plano-mensagens">Limite de Mensagens/Mês (0 = ilimitado)</Label>
              <Input 
                id="edit-plano-mensagens" 
                type="number" 
                placeholder="1000"
                value={editingPlanoForm.limite_mensagens_mes}
                onChange={(e) => setEditingPlanoForm(prev => ({ ...prev, limite_mensagens_mes: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-plano-popular" 
                checked={editingPlanoForm.is_popular}
                onCheckedChange={(checked) => setEditingPlanoForm(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label htmlFor="edit-plano-popular">Plano Popular</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleEditPlano}>
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setIsPlanoDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Master() {
  return (
    <ProtectedRoute requiredPermissions={['canAccessMaster']}>
      <MasterContent />
    </ProtectedRoute>
  );
}