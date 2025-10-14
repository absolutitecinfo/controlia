"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, Key, Bot, Users, Plus, Edit, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface Agent {
  id: number;
  name: string;
  description: string;
  instructions: string;
  iconUrl: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
}

export default function Admin() {
  const [apiKey, setApiKey] = useState("");
  const [enableByok, setEnableByok] = useState(false);
  
  // Estados para gerenciamento de agentes
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: "Assistente Geral",
      description: "Ajuda com tarefas gerais e perguntas diversas",
      instructions: "Você é um assistente geral prestativo. Ajude o usuário com suas dúvidas de forma clara e objetiva.",
      iconUrl: "/placeholder.svg",
      isActive: true,
      isPopular: true,
      createdAt: "2024-01-10"
    },
    {
      id: 2,
      name: "Desenvolvedor",
      description: "Especialista em programação e desenvolvimento",
      instructions: "Você é um desenvolvedor expert. Ajude com código, debugging e melhores práticas de programação.",
      iconUrl: "/placeholder.svg",
      isActive: true,
      isPopular: true,
      createdAt: "2024-01-11"
    },
    {
      id: 3,
      name: "Escritor",
      description: "Ajuda com redação e criação de conteúdo",
      instructions: "Você é um escritor profissional. Ajude com redação, revisão e criação de conteúdo criativo.",
      iconUrl: "/placeholder.svg",
      isActive: true,
      isPopular: true,
      createdAt: "2024-01-12"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    iconUrl: "",
    isActive: true,
    isPopular: false
  });
  
  // Estados para gerenciamento de usuários
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "João Silva",
      email: "joao@empresa.com",
      role: "Admin",
      status: "Ativo",
      lastAccess: "2024-01-15",
      avatar: "JS"
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@empresa.com",
      role: "Colaborador",
      status: "Ativo",
      lastAccess: "2024-01-14",
      avatar: "MS"
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@empresa.com",
      role: "Colaborador",
      status: "Inativo",
      lastAccess: "2024-01-10",
      avatar: "PC"
    }
  ]);

  const handleSave = () => {
    // TODO: Implement save logic
    console.log("Settings saved");
  };

  // Funções para gerenciamento de agentes
  const handleOpenDialog = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        description: agent.description,
        instructions: agent.instructions,
        iconUrl: agent.iconUrl,
        isActive: agent.isActive,
        isPopular: agent.isPopular
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: "",
        description: "",
        instructions: "",
        iconUrl: "",
        isActive: true,
        isPopular: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAgent(null);
    setFormData({
      name: "",
      description: "",
      instructions: "",
      iconUrl: "",
      isActive: true,
      isPopular: false
    });
  };

  const handleSaveAgent = () => {
    if (editingAgent) {
      // Editar agente existente
      setAgents(agents.map(agent =>
        agent.id === editingAgent.id
          ? { ...agent, ...formData }
          : agent
      ));
    } else {
      // Criar novo agente
      const newAgent: Agent = {
        id: Math.max(...agents.map(a => a.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAgents([...agents, newAgent]);
    }
    handleCloseDialog();
  };

  const handleDeleteAgent = (agentId: number) => {
    if (confirm("Tem certeza que deseja excluir este agente?")) {
      setAgents(agents.filter(agent => agent.id !== agentId));
    }
  };

  const handleAgentStatusToggle = (agentId: number) => {
    setAgents(agents.map(agent =>
      agent.id === agentId
        ? { ...agent, isActive: !agent.isActive }
        : agent
    ));
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implementar upload real para um servidor
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, iconUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserStatusToggle = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "Ativo" ? "Inativo" : "Ativo" }
        : user
    ));
  };

  const handleUserRoleChange = (userId: number, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole }
        : user
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do seu tenant
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="api" className="data-[state=active]:text-primary">
            <Key className="mr-2 h-4 w-4" />
            API & BYOK
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:text-primary">
            <Bot className="mr-2 h-4 w-4" />
            Agentes IA
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:text-primary">
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader>
              <CardTitle>BYOK - Bring Your Own Key</CardTitle>
              <CardDescription>
                Use sua própria chave de API para maior controle e segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="byok-toggle" className="text-base font-medium">
                    Habilitar BYOK
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Utilize sua própria chave de API OpenAI
                  </p>
                </div>
                <Switch
                  id="byok-toggle"
                  checked={enableByok}
                  onCheckedChange={setEnableByok}
                />
              </div>

              {enableByok && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label htmlFor="api-key">Chave API OpenAI</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-input border-border font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sua chave será criptografada e armazenada com segurança
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">Informações de Uso</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Requisições este mês</p>
                    <p className="text-2xl font-bold mt-1">12,458</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Custo estimado</p>
                    <p className="text-2xl font-bold mt-1">R$ 245,00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciamento de Agentes IA</CardTitle>
                  <CardDescription>
                    Crie e gerencie agentes personalizados para diferentes necessidades
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleOpenDialog()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Agente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAgent ? "Editar Agente" : "Criar Novo Agente"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAgent 
                          ? "Atualize as informações do agente"
                          : "Preencha as informações para criar um novo agente IA"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Upload de Ícone */}
                      <div className="space-y-2">
                        <Label>Ícone do Agente</Label>
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                            {formData.iconUrl ? (
                              <Image
                                src={formData.iconUrl}
                                alt="Agent icon"
                                width={80}
                                height={80}
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              id="icon-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleIconUpload}
                            />
                            <Label
                              htmlFor="icon-upload"
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted/50 transition-smooth w-fit">
                                <Upload className="h-4 w-4" />
                                <span className="text-sm">Upload de Imagem</span>
                              </div>
                            </Label>
                            <p className="text-xs text-muted-foreground mt-2">
                              PNG, JPG ou SVG. Tamanho recomendado: 128x128px
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Nome do Agente */}
                      <div className="space-y-2">
                        <Label htmlFor="agent-name">Nome do Agente *</Label>
                        <Input
                          id="agent-name"
                          placeholder="Ex: Analista Financeiro"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-input border-border"
                        />
                      </div>

                      {/* Descrição Curta */}
                      <div className="space-y-2">
                        <Label htmlFor="agent-desc">Descrição Curta *</Label>
                        <Input
                          id="agent-desc"
                          placeholder="Ex: Especialista em análise financeira e orçamentos"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="bg-input border-border"
                        />
                        <p className="text-xs text-muted-foreground">
                          Será exibida na seleção de agentes
                        </p>
                      </div>

                      {/* Instruções do Sistema */}
                      <div className="space-y-2">
                        <Label htmlFor="agent-instructions">Instruções do Sistema *</Label>
                        <Textarea
                          id="agent-instructions"
                          placeholder="Ex: Você é um analista financeiro experiente. Ajude o usuário com análises, projeções e recomendações financeiras. Seja sempre preciso com números e cite fontes quando possível..."
                          value={formData.instructions}
                          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                          className="min-h-[150px] bg-input border-border resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          Define o comportamento e personalidade do agente
                        </p>
                      </div>

                      {/* Configurações */}
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="font-medium">Configurações</h4>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Agente Ativo</Label>
                            <p className="text-sm text-muted-foreground">
                              Disponível para seleção pelos usuários
                            </p>
                          </div>
                          <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Agente Popular</Label>
                            <p className="text-sm text-muted-foreground">
                              Exibir nos botões de acesso rápido
                            </p>
                          </div>
                          <Switch
                            checked={formData.isPopular}
                            onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                          />
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={handleCloseDialog}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSaveAgent}
                          disabled={!formData.name || !formData.description || !formData.instructions}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {editingAgent ? "Atualizar Agente" : "Criar Agente"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estatísticas */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total de Agentes</p>
                  <p className="text-2xl font-bold mt-1">{agents.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                  <p className="text-2xl font-bold mt-1 text-primary">
                    {agents.filter(a => a.isActive).length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Agentes Populares</p>
                  <p className="text-2xl font-bold mt-1">
                    {agents.filter(a => a.isPopular).length}
                  </p>
                </div>
              </div>

              {/* Lista de Agentes */}
              <div className="space-y-4">
                <h4 className="font-medium">Lista de Agentes</h4>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        {/* Ícone do Agente */}
                        <div className="relative h-12 w-12 rounded-lg border border-border overflow-hidden bg-muted/30 flex items-center justify-center">
                          {agent.iconUrl ? (
                            <Image
                              src={agent.iconUrl}
                              alt={agent.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <Bot className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        {/* Informações do Agente */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{agent.name}</p>
                            {agent.isPopular && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                                Popular
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              agent.isActive 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}>
                              {agent.isActive ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{agent.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em: {agent.createdAt}
                          </p>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(agent)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={agent.isActive}
                          onCheckedChange={() => handleAgentStatusToggle(agent.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-border hover:border-primary transition-smooth card-hover-glow">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Administre os usuários do seu plano e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estatísticas dos usuários */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold mt-1">{users.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold mt-1 text-primary">
                    {users.filter(u => u.status === "Ativo").length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Administradores</p>
                  <p className="text-2xl font-bold mt-1">
                    {users.filter(u => u.role === "Admin").length}
                  </p>
                </div>
              </div>

              {/* Lista de usuários */}
              <div className="space-y-4">
                <h4 className="font-medium">Lista de Usuários</h4>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                          {user.avatar}
                        </div>
                        
                        {/* Informações do usuário */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.name}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === "Ativo" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Último acesso: {user.lastAccess}
                          </p>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex items-center gap-3">
                        {/* Seletor de Role */}
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                          className="px-3 py-1 text-sm border border-border rounded-md bg-background focus:ring-2 focus:ring-primary/20 transition-smooth"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Colaborador">Colaborador</option>
                          <option value="Visualizador">Visualizador</option>
                        </select>

                        {/* Toggle de Status */}
                        <Switch
                          checked={user.status === "Ativo"}
                          onCheckedChange={() => handleUserStatusToggle(user.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações em lote */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-4">Ações em Lote</h4>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    Convidar Usuário
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar Lista
                  </Button>
                  <Button variant="outline" size="sm">
                    Configurar Permissões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary btn-glow-primary transition-smooth"
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}

