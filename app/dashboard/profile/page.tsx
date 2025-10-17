"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building, Calendar, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/use-permissions";


export default function ProfilePage() {
  const permissions = usePermissions();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
  });

  useEffect(() => {
    if (permissions.userName) {
      setFormData({ nome_completo: permissions.userName });
    }
  }, [permissions.userName]);

  const handleSave = async () => {
    if (!permissions.userName) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Erro ao buscar ID do usuário');
      }
      
      const userData = await response.json();
      
      const updateResponse = await fetch(`/api/admin/usuarios/${userData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_completo: formData.nome_completo }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };


  const getRoleBadge = (role: string) => {
    const roleConfig = {
      master: { label: 'Master', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Administrador', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      colaborador: { label: 'Colaborador', variant: 'secondary' as const, color: 'bg-green-100 text-green-800' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.colaborador;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!permissions.userName || !permissions.userEmail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Suas informações básicas e de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(permissions.userName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{permissions.userName}</h3>
                <p className="text-sm text-muted-foreground">{permissions.userEmail}</p>
                {getRoleBadge(permissions.role || 'colaborador')}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                {editing ? (
                  <Input
                    id="nome"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm">{permissions.userName}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{permissions.userEmail}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <Label>Empresa</Label>
                <div className="flex items-center mt-1">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{permissions.empresaName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {editing ? (
                <>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setFormData({ nome_completo: permissions.userName || '' });
                  }}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Informações da Conta
            </CardTitle>
            <CardDescription>
              Detalhes sobre sua conta e atividade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status da Conta</span>
                <Badge className="bg-green-100 text-green-800">
                  Ativo
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Papel</span>
                {getRoleBadge(permissions.role || 'colaborador')}
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Empresa</span>
                <span className="text-sm text-muted-foreground">
                  {permissions.empresaName || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Permissões</span>
                <div className="flex flex-col items-end space-y-1">
                  {permissions.canViewDashboard && <Badge variant="outline" className="text-xs">Dashboard</Badge>}
                  {permissions.canViewChats && <Badge variant="outline" className="text-xs">Chats</Badge>}
                  {permissions.canManageAgents && <Badge variant="outline" className="text-xs">Agentes</Badge>}
                  {permissions.canManageCompany && <Badge variant="outline" className="text-xs">Empresa</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
