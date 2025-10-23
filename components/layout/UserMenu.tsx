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
    console.log('🔄 Iniciando logout...');
    setIsLoading(true);
    
    try {
      // 1. Chamar API de logout do servidor (limpa sessão server-side)
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (apiError) {
        console.error('Erro na API de logout (continuando):', apiError);
      }
      
      // 2. Fazer logout no cliente
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Erro no logout do Supabase:', error);
      }
      
      // 3. Limpar dados locais
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Mostrar feedback
      toast.success('Logout realizado com sucesso!');
      
      // 5. Redirecionar usando window.location (hard redirect limpa tudo)
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 100);
      
    } catch (error) {
      console.error('Erro no processo de logout:', error);
      
      // Mesmo com erro, limpar dados locais e redirecionar
      localStorage.clear();
      sessionStorage.clear();
      
      toast.error('Erro no logout, mas você será redirecionado...');
      
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 500);
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
