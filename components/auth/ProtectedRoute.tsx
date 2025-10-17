"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  fallbackRoute?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions, 
  fallbackRoute = "/dashboard" 
}: ProtectedRouteProps) {
  const permissions = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!permissions.loading) {
      const hasPermission = requiredPermissions.some(permission => 
        permissions[permission as keyof typeof permissions]
      );

      if (!hasPermission) {
        router.push(fallbackRoute as any);
      }
    }
  }, [permissions, requiredPermissions, fallbackRoute, router]);

  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const hasPermission = requiredPermissions.some(permission => 
    permissions[permission as keyof typeof permissions]
  );

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button 
            onClick={() => router.push(fallbackRoute as any)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
