"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'check-email') {
      toast.success("Verifique seu email para confirmar a conta");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Erro ao fazer login");
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('perfis')
        .select(`
          *,
          empresas (
            id,
            nome,
            status,
            plano_id,
            planos (
              nome,
              preco_mensal,
              max_usuarios,
              max_agentes,
              limite_mensagens_mes
            )
          )
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error("Erro ao carregar perfil do usuário");
        return;
      }

      if (!profile) {
        toast.error("Perfil não encontrado");
        return;
      }

      // Verificar se usuário está ativo
      if (profile.status !== 'ativo') {
        await supabase.auth.signOut();
        toast.error("Sua conta está suspensa. Entre em contato com o suporte.");
        return;
      }

      // Verificar se empresa está ativa
      if (profile.empresas?.status !== 'ativo') {
        await supabase.auth.signOut();
        toast.error("Sua empresa está suspensa. Entre em contato com o suporte.");
        return;
      }

      // Redirecionar baseado no role
      switch (profile.role) {
        case 'master':
          router.push('/dashboard/master');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'user':
          router.push('/dashboard/colaborador');
          break;
        default:
          router.push('/dashboard');
      }

      toast.success("Login realizado com sucesso!");

    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Email ou senha incorretos");
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Confirme seu email antes de fazer login");
      } else {
        toast.error(error.message || "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-hero-gradient">
              ControlIA.io
            </h1>
          </Link>
        </div>
        
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link href="/auth/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

