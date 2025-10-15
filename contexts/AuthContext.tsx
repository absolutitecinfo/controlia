'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  nome_completo: string | null;
  telefone: string | null;
  cargo: string | null;
  empresa_id: number;
  role: 'master' | 'admin' | 'user';
  status: 'ativo' | 'inativo' | 'suspenso';
  ultimo_acesso: string | null;
  avatar_url: string | null;
  empresas: {
    id: number;
    nome: string;
    email: string;
    status: 'ativo' | 'suspenso' | 'banido' | 'em_atraso';
    plano_id: number;
    planos: {
      nome: string;
      preco_mensal: number;
      max_usuarios: number;
      max_agentes: number | null;
      limite_mensagens_mes: number | null;
    };
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = isSupabaseConfigured ? createClient() : null;

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      console.warn('Supabase not configured, skipping profile fetch');
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('perfis')
        .select(`
          *,
          empresas (
            id,
            nome,
            email,
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
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
