import { useState, useEffect } from 'react';

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewChats: boolean;
  canManageAgents: boolean;
  canManageCompany: boolean;
  canAccessMaster: boolean;
  role: string | null;
  empresaName: string | null;
  userName: string | null;
  userEmail: string | null;
  loading: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({
    canViewDashboard: false,
    canViewChats: false,
    canManageAgents: false,
    canManageCompany: false,
    canAccessMaster: false,
    role: null,
    empresaName: null,
    userName: null,
    userEmail: null,
    loading: true
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Buscar informações do usuário
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Erro ao buscar permissões');
        }
        
        const userData = await response.json();
        const role = userData.role;
        const empresaName = userData.empresaName;

        // Definir permissões baseadas no papel
        const userPermissions: UserPermissions = {
          canViewDashboard: ['admin', 'colaborador', 'master'].includes(role),
          canViewChats: ['admin', 'colaborador', 'master'].includes(role),
          canManageAgents: ['admin', 'master'].includes(role),
          canManageCompany: ['admin', 'master'].includes(role),
          canAccessMaster: role === 'master',
          role,
          empresaName,
          userName: userData.nome_completo || null,
          userEmail: userData.email || null,
          loading: false
        };

        setPermissions(userPermissions);
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPermissions();
  }, []);

  return permissions;
}
