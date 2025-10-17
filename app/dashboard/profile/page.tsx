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
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  nome_completo: string;
  role: string;
  status: string;
  empresa_name: string;
  created_at: string;
  last_sign_in_at?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Erro ao buscar perfil');
      }
      
      const userData = await response.json();
      
      // Buscar dados completos do perfil
      const supabase = createClient();
      const { data: profileData, error } = await supabase
        .from('perfis')
        .select(`
          id,
          nome_completo,
          role,
          status,
          created_at,
          last_sign_in_at,
          empresas (
            nome
          )
        `)
        .eq('id', userData.id)
        .single();

      if (error) {
        throw new Error('Erro ao buscar dados do perfil');
      }

      const fullProfile: UserProfile = {
        id: profileData.id,
        email: userData.email,
        nome_completo: profileData.nome_completo,
        role: profileData.role,
        status: profileData.status,
        empresa_name: profileData.empresas?.nome || 'N/A',
        created_at: profileData.created_at,
        last_sign_in_at: profileData.last_sign_in_at
      };

      setProfile(fullProfile);
      setFormData({ nome_completo: fullProfile.nome_completo });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/usuarios/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_completo: formData.nome_completo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      setProfile(prev => prev ? { ...prev, nome_completo: formData.nome_completo } : null);
      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
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
                  {getInitials(profile.nome_completo)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{profile.nome_completo}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                {getRoleBadge(profile.role)}
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
                  <p className="mt-1 text-sm">{profile.nome_completo}</p>
                )}
              </div>

              <div>
                <Label>Email</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{profile.email}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <Label>Empresa</Label>
                <div className="flex items-center mt-1">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">{profile.empresa_name}</p>
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
                    setFormData({ nome_completo: profile.nome_completo });
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
                <Badge className={profile.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {profile.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Papel</span>
                {getRoleBadge(profile.role)}
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Membro desde</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(profile.created_at)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm font-medium">Último acesso</span>
                <span className="text-sm text-muted-foreground">
                  {profile.last_sign_in_at ? formatDate(profile.last_sign_in_at) : 'Nunca'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
