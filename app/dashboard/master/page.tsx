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
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
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
  Calendar,
  Mail,
  Phone,
  MapPin,
  Crown,
  Star,
  Shield
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// Tipos de dados
interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: "Free" | "Básico" | "Empresa" | "Master";
  status: "Ativo" | "Suspenso" | "Banido" | "Em Atraso";
  usersCount: number;
  monthlyRevenue: number;
  joinDate: string;
  nextBilling: string;
  isActive: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  color: string;
}

// Dados simulados
const companies: Company[] = [
  {
    id: "0",
    name: "Startup Iniciante",
    email: "contato@startupiniciante.com",
    phone: "(11) 88888-8888",
    address: "São Paulo, SP",
    plan: "Free",
    status: "Ativo",
    usersCount: 2,
    monthlyRevenue: 0,
    joinDate: "2024-11-01",
    nextBilling: "N/A",
    isActive: true
  },
  {
    id: "1",
    name: "TechCorp Solutions",
    email: "admin@techcorp.com",
    phone: "(11) 99999-9999",
    address: "São Paulo, SP",
    plan: "Master",
    status: "Ativo",
    usersCount: 45,
    monthlyRevenue: 299.90,
    joinDate: "2024-01-15",
    nextBilling: "2024-12-15",
    isActive: true
  },
  {
    id: "2",
    name: "Inovação Digital Ltda",
    email: "contato@inovacao.com",
    phone: "(21) 88888-8888",
    address: "Rio de Janeiro, RJ",
    plan: "Empresa",
    status: "Ativo",
    usersCount: 25,
    monthlyRevenue: 149.90,
    joinDate: "2024-02-20",
    nextBilling: "2024-12-20",
    isActive: true
  },
  {
    id: "3",
    name: "StartupXYZ",
    email: "hello@startupxyz.com",
    phone: "(31) 77777-7777",
    address: "Belo Horizonte, MG",
    plan: "Básico",
    status: "Em Atraso",
    usersCount: 8,
    monthlyRevenue: 49.90,
    joinDate: "2024-03-10",
    nextBilling: "2024-11-10",
    isActive: true
  },
  {
    id: "4",
    name: "Empresa Suspensa",
    email: "admin@suspensa.com",
    phone: "(41) 66666-6666",
    address: "Curitiba, PR",
    plan: "Empresa",
    status: "Suspenso",
    usersCount: 15,
    monthlyRevenue: 149.90,
    joinDate: "2024-01-05",
    nextBilling: "2024-12-05",
    isActive: false
  }
];

const plans: Plan[] = [
  {
    id: "0",
    name: "Free",
    price: 0,
    maxUsers: 3,
    features: ["1 Agente IA", "Suporte por Email", "Relatórios Básicos", "Limite de 100 mensagens/mês"],
    isActive: true,
    color: "hsl(142, 76%, 36%)"
  },
  {
    id: "1",
    name: "Básico",
    price: 49.90,
    maxUsers: 10,
    features: ["5 Agentes IA", "Suporte por Email", "Relatórios Básicos", "1.000 mensagens/mês"],
    isActive: true,
    color: "hsl(166, 100%, 50%)"
  },
  {
    id: "2",
    name: "Empresa",
    price: 149.90,
    maxUsers: 50,
    features: ["15 Agentes IA", "Suporte Prioritário", "Relatórios Avançados", "API Access", "10.000 mensagens/mês"],
    isActive: true,
    color: "hsl(42, 100%, 48%)"
  },
  {
    id: "3",
    name: "Master",
    price: 299.90,
    maxUsers: 200,
    features: ["Agentes Ilimitados", "Suporte 24/7", "Relatórios Customizados", "API Completa", "White Label", "Mensagens Ilimitadas"],
    isActive: true,
    color: "hsl(0, 0%, 69%)"
  }
];

// Estatísticas calculadas
const stats = {
  totalCompanies: companies.length,
  activeCompanies: companies.filter(c => c.status === "Ativo").length,
  suspendedCompanies: companies.filter(c => c.status === "Suspenso").length,
  overdueCompanies: companies.filter(c => c.status === "Em Atraso").length,
  totalRevenue: companies.reduce((sum, c) => sum + c.monthlyRevenue, 0),
  planDistribution: {
    free: companies.filter(c => c.plan === "Free").length,
    basico: companies.filter(c => c.plan === "Básico").length,
    empresa: companies.filter(c => c.plan === "Empresa").length,
    master: companies.filter(c => c.plan === "Master").length
  }
};

export default function Master() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Filtrar empresas
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || company.status === statusFilter;
    const matchesPlan = planFilter === "all" || company.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleCompanyAction = (company: Company, action: string) => {
    console.log(`${action} empresa:`, company.name);
    // Aqui você implementaria as ações reais
  };

  const handlePlanToggle = (plan: Plan) => {
    console.log(`Toggle plano:`, plan.name);
    // Aqui você implementaria a ativação/desativação do plano
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Ativo": "default",
      "Suspenso": "secondary", 
      "Banido": "destructive",
      "Em Atraso": "outline"
    } as const;
    
    const icons = {
      "Ativo": <CheckCircle className="h-3 w-3" />,
      "Suspenso": <AlertTriangle className="h-3 w-3" />,
      "Banido": <Ban className="h-3 w-3" />,
      "Em Atraso": <XCircle className="h-3 w-3" />
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      "Free": "bg-green-600",
      "Básico": "bg-teal-500",
      "Empresa": "bg-yellow-500", 
      "Master": "bg-gray-500"
    };
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${colors[plan as keyof typeof colors]}`} />
        {plan}
      </Badge>
    );
  };

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
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.activeCompanies} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">
              +12.5% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes em Atraso</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueCompanies}</div>
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
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground mt-2">
              -0.8% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Planos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              Plano Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.planDistribution.free}</div>
            <p className="text-sm text-muted-foreground">empresas</p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-teal-500" />
              Plano Básico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.planDistribution.basico}</div>
            <p className="text-sm text-muted-foreground">empresas</p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              Plano Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.planDistribution.empresa}</div>
            <p className="text-sm text-muted-foreground">empresas</p>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              Plano Master
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.planDistribution.master}</div>
            <p className="text-sm text-muted-foreground">empresas</p>
          </CardContent>
        </Card>
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getPlanBadge(company.plan)}
                          {getStatusBadge(company.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
                        {company.monthlyRevenue === 0 ? "Grátis" : `R$ ${company.monthlyRevenue.toFixed(2)}/mês`}
                      </p>
                      <p className="text-sm text-muted-foreground">{company.usersCount} usuários</p>
                      <p className="text-xs text-muted-foreground">
                        {company.nextBilling === "N/A" ? "Sem cobrança" : `Próximo: ${company.nextBilling}`}
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
                          setSelectedCompany(company);
                          setIsCompanyDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCompanyAction(company, "edit")}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {company.status === "Ativo" ? (
                          <DropdownMenuItem 
                            onClick={() => handleCompanyAction(company, "suspend")}
                            className="text-yellow-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleCompanyAction(company, "activate")}
                            className="text-green-600"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleCompanyAction(company, "ban")}
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
                <Button onClick={() => {
                  setEditingPlan(null);
                  setIsPlanDialogOpen(true);
                }}>
                  Novo Plano
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="border-border hover:border-primary transition-smooth">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: plan.color }}
                          />
                          {plan.name}
                        </CardTitle>
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={() => handlePlanToggle(plan)}
                        />
                      </div>
                      <CardDescription>
                        Até {plan.maxUsers} usuários
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">
                        {plan.price === 0 ? (
                          <span>Grátis</span>
                        ) : (
                          <>
                            R$ {plan.price.toFixed(2)}<span className="text-sm font-normal">/mês</span>
                          </>
                        )}
                      </div>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
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
                          onClick={() => {
                            setEditingPlan(plan);
                            setIsPlanDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
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
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
            <DialogDescription>
              Informações completas e histórico de ações
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Nome da Empresa</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Endereço</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plano Atual</Label>
                  <div className="mt-1">{getPlanBadge(selectedCompany.plan)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Usuários</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.usersCount} usuários</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Receita Mensal</Label>
                  <p className="text-sm text-muted-foreground">R$ {selectedCompany.monthlyRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Adesão</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Próxima Cobrança</Label>
                  <p className="text-sm text-muted-foreground">{selectedCompany.nextBilling}</p>
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
                <Button variant="destructive" className="flex-1">
                  <Ban className="h-4 w-4 mr-2" />
                  Banir Empresa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Plano */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar Plano" : "Novo Plano"}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes do plano de assinatura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan-name">Nome do Plano</Label>
              <Input 
                id="plan-name" 
                placeholder="Ex: Básico, Empresa, Master"
                defaultValue={editingPlan?.name || ""}
              />
            </div>
            <div>
              <Label htmlFor="plan-price">Preço Mensal (R$)</Label>
              <Input 
                id="plan-price" 
                type="number" 
                placeholder="49.90"
                defaultValue={editingPlan?.price || ""}
              />
            </div>
            <div>
              <Label htmlFor="plan-users">Máximo de Usuários</Label>
              <Input 
                id="plan-users" 
                type="number" 
                placeholder="10"
                defaultValue={editingPlan?.maxUsers || ""}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="plan-active" defaultChecked={editingPlan?.isActive || true} />
              <Label htmlFor="plan-active">Plano Ativo</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1">Salvar Plano</Button>
              <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}