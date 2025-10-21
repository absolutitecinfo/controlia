"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Settings, CreditCard, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/hooks/use-permissions";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function UserMenu() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const permissions = usePermissions();

  // Evita mismatches de hidratação: renderiza somente após montar no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    console.log('🔄 Iniciando logout robusto...');
    setIsLoading(true);
    
    // Função para limpar dados locais de forma segura
    const clearLocalData = () => {
      try {
        console.log('🧹 Limpando dados locais...');
        
        // Limpar localStorage
        localStorage.clear();
        
        // Limpar sessionStorage
        sessionStorage.clear();
        
        // Limpar cookies específicos do Supabase
        const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token'];
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
        
        console.log('✅ Dados locais limpos com sucesso');
        return true;
      } catch (error) {
        console.error('❌ Erro ao limpar dados locais:', error);
        return false;
      }
    };
    
    // Função para logout no Supabase com retry
    const performSupabaseLogout = async () => {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`🔐 Tentativa ${attempts}/${maxAttempts} de logout no Supabase`);
        
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signOut();
          
          if (!error) {
            console.log('✅ Logout no Supabase bem-sucedido');
            return true;
          }
          
          console.error(`❌ Erro no logout (tentativa ${attempts}):`, error);
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`❌ Exceção no logout (tentativa ${attempts}):`, error);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      console.log('⚠️ Logout no Supabase falhou após todas as tentativas');
      return false;
    };
    
    // Função para redirecionamento com múltiplas estratégias
    const performRedirect = () => {
      console.log('🚀 Iniciando redirecionamento...');
      
      const strategies = [
        () => {
          console.log('📱 Estratégia 1: window.location.href');
          window.location.href = '/auth/login';
        },
        () => {
          console.log('🔄 Estratégia 2: router.push');
          router.push('/auth/login');
        },
        () => {
          console.log('🔄 Estratégia 3: window.location.replace');
          window.location.replace('/auth/login');
        },
        () => {
          console.log('🔄 Estratégia 4: window.location.reload + redirect');
          window.location.reload();
        }
      ];
      
      let strategyIndex = 0;
      
      const tryNextStrategy = () => {
        if (strategyIndex < strategies.length) {
          try {
            strategies[strategyIndex]();
          } catch (error) {
            console.error(`❌ Estratégia ${strategyIndex + 1} falhou:`, error);
            strategyIndex++;
            setTimeout(tryNextStrategy, 500);
          }
        } else {
          console.log('🆘 Todas as estratégias de redirecionamento falharam');
          // Último recurso: criar um link e clicar
          const link = document.createElement('a');
          link.href = '/auth/login';
          link.click();
        }
      };
      
      // Aguardar um pouco antes de tentar redirecionar
      setTimeout(tryNextStrategy, 200);
    };
    
    try {
      // 1. Limpar dados locais primeiro
      clearLocalData();
      
      // 2. Tentar logout no Supabase
      const supabaseSuccess = await performSupabaseLogout();
      
      // 3. Mostrar toast baseado no resultado
      if (supabaseSuccess) {
        toast.success('✅ Logout realizado com sucesso!');
      } else {
        toast.warning('⚠️ Logout com aviso, mas redirecionando...');
      }
      
      // 4. Sempre tentar redirecionar
      performRedirect();
      
    } catch (error) {
      console.error('❌ Erro geral no logout:', error);
      toast.error('❌ Erro no logout, mas redirecionando...');
      performRedirect();
    } finally {
      // Resetar loading após um tempo
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDisplayName = () => {
    return permissions.userName || permissions.empresaName || 'Usuário';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          disabled={isLoading}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {getInitials(getDisplayName())}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getDisplayName()}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {permissions.role === 'master' ? 'Master' : 
               permissions.role === 'admin' ? 'Administrador' : 
               'Colaborador'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => router.push('/dashboard/profile')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push('/dashboard/settings')}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push('/dashboard/subscription')}
          className="cursor-pointer"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Assinatura</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Saindo...' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
