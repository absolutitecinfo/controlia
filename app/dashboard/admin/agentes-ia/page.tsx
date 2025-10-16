"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAgentes, type Agent } from "@/hooks/use-agentes";

export default function AgentesIA() {
  // Hook para gerenciar agentes
  const { agents, loading, error, createAgent, updateAgent, deleteAgent } = useAgentes();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    instrucoes: "",
    icone_url: "",
    is_active: true,
    is_popular: false,
    cor: "#3B82F6"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funções para gerenciamento de agentes
  const handleOpenDialog = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        nome: agent.nome,
        descricao: agent.descricao,
        instrucoes: agent.instrucoes,
        icone_url: agent.icone_url || "",
        is_active: agent.is_active,
        is_popular: agent.is_popular,
        cor: agent.cor || "#3B82F6"
      });
    } else {
      setEditingAgent(null);
      setFormData({
        nome: "",
        descricao: "",
        instrucoes: "",
        icone_url: "",
        is_active: true,
        is_popular: false,
        cor: "#3B82F6"
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAgent(null);
    setFormData({
      nome: "",
      descricao: "",
      instrucoes: "",
      icone_url: "",
      is_active: true,
      is_popular: false,
      cor: "#3B82F6"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, formData);
      } else {
        await createAgent(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar agente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este agente?')) {
      try {
        await deleteAgent(id);
      } catch (error) {
        console.error('Erro ao deletar agente:', error);
      }
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    try {
      await updateAgent(agent.id, { is_active: !agent.is_active });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleTogglePopular = async (agent: Agent) => {
    try {
      await updateAgent(agent.id, { is_popular: !agent.is_popular });
    } catch (error) {
      console.error('Erro ao alterar popularidade:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando agentes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Erro ao carregar agentes: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agentes IA</h1>
          <p className="text-muted-foreground">
            Gerencie os agentes de inteligência artificial da sua empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? 'Editar Agente' : 'Criar Novo Agente'}
              </DialogTitle>
              <DialogDescription>
                {editingAgent 
                  ? 'Atualize as informações do agente' 
                  : 'Configure um novo agente de IA para sua empresa'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Agente</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Assistente de Vendas"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cor">Cor do Agente</Label>
                  <Input
                    id="cor"
                    type="color"
                    value={formData.cor}
                    onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição do que o agente faz"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instrucoes">Instruções do Sistema</Label>
                <Textarea
                  id="instrucoes"
                  value={formData.instrucoes}
                  onChange={(e) => setFormData({ ...formData, instrucoes: e.target.value })}
                  placeholder="Instruções detalhadas sobre como o agente deve se comportar..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="icone_url">URL do Ícone (opcional)</Label>
                <Input
                  id="icone_url"
                  value={formData.icone_url}
                  onChange={(e) => setFormData({ ...formData, icone_url: e.target.value })}
                  placeholder="https://exemplo.com/icone.png"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                  />
                  <Label htmlFor="is_popular">Popular</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingAgent ? 'Atualizar' : 'Criar'} Agente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => a.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agentes Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => a.is_popular).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agentes Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.filter(a => !a.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {agent.icone_url ? (
                    <Image
                      src={agent.icone_url}
                      alt={agent.nome}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: agent.cor }}
                    >
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{agent.nome}</CardTitle>
                    <CardDescription className="text-sm">
                      {agent.descricao}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={agent.is_active}
                    onCheckedChange={() => handleToggleStatus(agent)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${
                    agent.is_active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {agent.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Popular:</span>
                  <Switch
                    checked={agent.is_popular}
                    onCheckedChange={() => handleTogglePopular(agent)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Criado em:</span>
                  <span className="text-sm">
                    {new Date(agent.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(agent)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(agent.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum agente criado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro agente de IA para começar
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Agente
          </Button>
        </div>
      )}
    </div>
  );
}