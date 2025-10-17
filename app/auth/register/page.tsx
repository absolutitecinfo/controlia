"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      console.log('Starting registration process...');
      console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
      });
      
      const supabase = createClient();
      console.log('Supabase client created successfully');
      
      // 1. Criar usuário no Supabase Auth
      console.log('Step 1: Creating user in Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      console.log('Auth result:', { authData, authError });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('No user created');
        throw new Error("Erro ao criar usuário");
      }

      console.log('User created successfully:', authData.user.id);

      // Em desenvolvimento, confirmar email automaticamente
      if (process.env.NODE_ENV === 'development') {
        console.log('Step 1.5: Confirming email in development...');
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          authData.user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.warn('Erro ao confirmar email automaticamente:', confirmError);
        } else {
          console.log('Email confirmed successfully');
        }
      }

      // 2. Buscar o plano Free
      console.log('Step 2: Fetching Free plan...');
      const { data: planoFree, error: planoError } = await supabase
        .from('planos')
        .select('id, nome, preco_mensal')
        .eq('nome', 'Free')
        .eq('is_active', true)
        .single();

      console.log('Plan result:', { planoFree, planoError });

      if (planoError) {
        console.error('Plan error:', planoError);
        throw new Error(`Erro ao buscar plano Free: ${planoError.message}`);
      }

      if (!planoFree) {
        console.error('No Free plan found');
        throw new Error("Plano Free não encontrado. Entre em contato com o suporte.");
      }

      console.log('Free plan found:', planoFree);

      // 3. Criar empresa
      console.log('Step 3: Creating empresa...');
      console.log('Empresa data to insert:', {
        nome: formData.company,
        email: formData.email,
        plano_id: planoFree.id,
        status: 'ativo',
        data_adesao: new Date().toISOString().split('T')[0],
      });
      
      const empresaInsertData = {
        nome: formData.company,
        email: formData.email,
        plano_id: planoFree.id,
        status: 'ativo',
        data_adesao: new Date().toISOString().split('T')[0],
      };
      
      console.log('About to insert empresa with data:', empresaInsertData);
      
      let empresa, empresaError;
      try {
        const result = await supabase
          .from('empresas')
          .insert(empresaInsertData)
          .select()
          .single();
        
        empresa = result.data;
        empresaError = result.error;
        
        console.log('Empresa insertion completed');
        console.log('Empresa result:', { empresa, empresaError });
        console.log('Empresa result type:', typeof empresaError);
        console.log('Empresa error constructor:', empresaError?.constructor?.name);
        
        if (empresaError) {
          console.log('Empresa error stringified:', JSON.stringify(empresaError, null, 2));
        }
      } catch (insertError) {
        console.error('Exception during empresa insertion:', insertError);
        empresaError = insertError;
      }

      if (empresaError) {
        console.error('Empresa error:', empresaError);
        const errorDetails = empresaError as any;
        console.error('Empresa error details:', {
          message: errorDetails.message,
          details: errorDetails.details,
          hint: errorDetails.hint,
          code: errorDetails.code
        });
        
        // Provide more specific error messages
        if (errorDetails.code === '23505') {
          throw new Error('Este email já está em uso. Tente outro email.');
        } else if (errorDetails.code === '23503') {
          throw new Error('Erro de referência no banco de dados. Tente novamente.');
        } else {
          throw new Error(`Erro ao criar empresa: ${errorDetails.message || 'Erro desconhecido'}`);
        }
      }

      console.log('Empresa created successfully:', empresa.id);

      // 4. Atualizar perfil do usuário (usando RPC para bypass RLS)
      console.log('Step 4: Updating user profile...');
      const { error: perfilError } = await supabase.rpc('update_user_profile', {
        user_id: authData.user.id,
        nome_completo: formData.name,
        empresa_id: empresa.id,
        role: 'admin',
        status: 'ativo'
      });

      console.log('Profile update result:', { perfilError });

      if (perfilError) {
        console.error('Erro ao atualizar perfil via RPC:', perfilError);
        
        // Fallback: try direct update (might fail due to RLS)
        console.log('Trying fallback profile update...');
        const { error: fallbackError } = await supabase
          .from('perfis')
          .update({
            nome_completo: formData.name,
            empresa_id: empresa.id,
            role: 'admin',
            status: 'ativo',
          })
          .eq('id', authData.user.id);

        console.log('Fallback result:', { fallbackError });

        if (fallbackError) {
          console.error('Erro no fallback de atualização de perfil:', fallbackError);
          throw new Error('Erro ao atualizar perfil do usuário. Tente fazer login novamente.');
        }
      }

      console.log('Profile updated successfully');

      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
      router.push("/auth/login?message=check-email");

    } catch (error: unknown) {
      console.error('Registration error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        const supabaseError = error as any;
        console.error('Supabase error object:', supabaseError);
        
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error?.message) {
          errorMessage = supabaseError.error.message;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        } else if (supabaseError.hint) {
          errorMessage = supabaseError.hint;
        } else if (supabaseError.code) {
          errorMessage = `Erro ${supabaseError.code}: ${supabaseError.message || 'Erro desconhecido'}`;
        }
      }
      
      // Translate common errors to Portuguese
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique o formato.';
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (errorMessage.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'Este email já está em uso. Tente outro email.';
      } else if (errorMessage.includes('Perfil não encontrado')) {
        errorMessage = 'Erro ao criar perfil do usuário. Tente novamente.';
      } else if (errorMessage.includes('23505')) {
        errorMessage = 'Este email já está em uso. Tente outro email.';
      } else if (errorMessage.includes('23503')) {
        errorMessage = 'Erro de referência no banco de dados. Tente novamente.';
      }
      
      toast.error(errorMessage);
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
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados para começar gratuitamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Minha Empresa Ltda"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  className="bg-input border-border"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-primary"
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link href="/auth/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

