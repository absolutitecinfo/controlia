"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Key, Users } from "lucide-react";
import { useState } from "react";

export default function Admin() {
  const [apiKey, setApiKey] = useState("");
  const [enableByok, setEnableByok] = useState(false);
  
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

