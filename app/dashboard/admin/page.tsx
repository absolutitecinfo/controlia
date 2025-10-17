"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, Key, Users, Loader2, CheckCircle, XCircle, Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useEmpresa } from "@/hooks/use-empresa";
import { useUsuarios, type Usuario, type CreateUsuarioData } from "@/hooks/use-usuarios";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function AdminContent() {
  const { config, loading, updateConfig, validateApiKey } = useEmpresa();
  const { 
    usuarios, 
    loading: usuariosLoading, 
    createUsuario, 
    updateUsuario, 
    deleteUsuario, 
    toggleStatus, 
    changeRole 
  } = useUsuarios();
  
  const [apiKey, setApiKey] = useState("");
  const [contextoIa, setContextoIa] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
  // Estados para gerenciamento de usuários
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [newUsuario, setNewUsuario] = useState<CreateUsuarioData>({
    email: '',
    nome_completo: '',
    role: 'colaborador'
  });

  // Atualizar estados quando config carregar
  useEffect(() => {
    if (config) {
      setApiKey(config.chave_api_llm || "");
      setContextoIa(config.contexto_ia || "");
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        chave_api_llm: apiKey,
        contexto_ia: contextoIa
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidatingKey(true);
    setKeyValidationStatus('idle');
    
    try {
      const isValid = await validateApiKey(apiKey);
      setKeyValidationStatus(isValid ? 'valid' : 'invalid');
    } catch {
      setKeyValidationStatus('invalid');
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleCreateUsuario = async () => {
    try {
      await createUsuario(newUsuario);
      setNewUsuario({ email: '', nome_completo: '', role: 'colaborador' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUsuario = async () => {
    if (!editingUsuario) return;
    
    try {
      await updateUsuario(editingUsuario.id, {
        nome_completo: editingUsuario.nome_completo,
        role: editingUsuario.role
      });
      setIsEditDialogOpen(false);
      setEditingUsuario(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (confirm(`Tem certeza que deseja deletar o usuário ${usuario.nome_completo}?`)) {
      try {
        await deleteUsuario(usuario.id);
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      await toggleStatus(usuario.id, usuario.status);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleChangeRole = async (usuario: Usuario, newRole: string) => {
    try {
      await changeRole(usuario.id, newRole);
    } catch (error) {
      console.error('Erro ao alterar papel:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">Chave de API OpenAI/Claude</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-... ou claude-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidateKey}
                      disabled={!apiKey.trim() || isValidatingKey}
                    >
                      {isValidatingKey ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : keyValidationStatus === 'valid' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : keyValidationStatus === 'invalid' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        "Validar"
                      )}
                    </Button>
                  </div>
                  {keyValidationStatus === 'valid' && (
                    <p className="text-sm text-green-600 mt-1">✓ Chave API válida</p>
                  )}
                  {keyValidationStatus === 'invalid' && (
                    <p className="text-sm text-red-600 mt-1">✗ Chave API inválida</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Sua chave será criptografada e armazenada com segurança
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="contexto-ia">Contexto da IA</Label>
                  <textarea
                    id="contexto-ia"
                    className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="Configure o contexto e personalidade da IA para sua empresa..."
                    value={contextoIa}
                    onChange={(e) => setContextoIa(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Este contexto será usado em todas as conversas com a IA
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plano Atual */}
          {config && 'planos' in config && (config as any).planos && (
            <Card>
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>
                  Informações sobre seu plano de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Plano</Label>
                    <p className="text-lg font-semibold">{(config as { planos: { nome: string } }).planos.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preço Mensal</Label>
                    <p className="text-lg font-semibold">
                      R$ {(config as { planos: { preco_mensal: number } }).planos.preco_mensal.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Limite de Mensagens</Label>
                    <p className="text-lg font-semibold">
                      {(config as { planos: { limite_mensagens_mes?: number } }).planos.limite_mensagens_mes?.toLocaleString() || 'Ilimitado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>
                    Controle o acesso e permissões dos colaboradores
                  </CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {usuariosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando usuários...</span>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Adicione o primeiro usuário para começar
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{getInitials(usuario.nome_completo)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{usuario.nome_completo}</p>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Último acesso: {usuario.last_sign_in_at ? formatDate(usuario.last_sign_in_at) : 'Nunca'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={usuario.role}
                          onChange={(e) => handleChangeRole(usuario, e.target.value)}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="colaborador">Colaborador</option>
                        </select>
                        <Switch
                          checked={usuario.status === "ativo"}
                          onCheckedChange={() => handleToggleStatus(usuario)}
                        />
                        <span className={`text-sm ${
                          usuario.status === "ativo" ? "text-green-600" : "text-red-600"
                        }`}>
                          {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUsuario(usuario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUsuario(usuario)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar usuário */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Crie uma nova conta para um colaborador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="usuario@empresa.com"
                value={newUsuario.email}
                onChange={(e) => setNewUsuario(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="new-name">Nome Completo</Label>
              <Input
                id="new-name"
                placeholder="João Silva"
                value={newUsuario.nome_completo}
                onChange={(e) => setNewUsuario(prev => ({ ...prev, nome_completo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="new-role">Papel</Label>
              <select
                id="new-role"
                value={newUsuario.role}
                onChange={(e) => setNewUsuario(prev => ({ ...prev, role: e.target.value as 'admin' | 'colaborador' }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="colaborador">Colaborador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUsuario}
              disabled={!newUsuario.email || !newUsuario.nome_completo}
            >
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          {editingUsuario && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUsuario.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O email não pode ser alterado
                </p>
              </div>
              <div>
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editingUsuario.nome_completo}
                  onChange={(e) => setEditingUsuario(prev => prev ? { ...prev, nome_completo: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Papel</Label>
                <select
                  id="edit-role"
                  value={editingUsuario.role}
                  onChange={(e) => setEditingUsuario(prev => prev ? { ...prev, role: e.target.value as 'admin' | 'colaborador' } : null)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUsuario}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute requiredPermissions={['canManageCompany']}>
      <AdminContent />
    </ProtectedRoute>
  );
}