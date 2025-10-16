"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Key, Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useEmpresa } from "@/hooks/use-empresa";

export default function Admin() {
  const { config, loading, updateConfig, validateApiKey } = useEmpresa();
  
  const [apiKey, setApiKey] = useState("");
  const [contextoIa, setContextoIa] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
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
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Controle o acesso e permissões dos colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{user.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Último acesso: {user.lastAccess}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Colaborador">Colaborador</option>
                      </select>
                      <Switch
                        checked={user.status === "Ativo"}
                        onCheckedChange={() => handleUserStatusToggle(user.id)}
                      />
                      <span className={`text-sm ${
                        user.status === "Ativo" ? "text-green-600" : "text-red-600"
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}