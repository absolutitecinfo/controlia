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
        console.log('🔍 usePermissions - Buscando permissões...');
        
        // Buscar informações do usuário
        const response = await fetch('/api/auth/me');
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Erro na resposta:', errorData);
          throw new Error(errorData.error || 'Erro ao buscar permissões');
        }
        
        const userData = await response.json();
        console.log('✅ Dados do usuário recebidos:', { 
          role: userData.role, 
          email: userData.email,
          empresaName: userData.empresaName 
        });
        
        const role = userData.role;
        const empresaName = userData.empresaName;

        // Definir permissões baseadas no papel
        const userPermissions: UserPermissions = {
          canViewDashboard: ['admin', 'master'].includes(role), // Usuário comum não vê dashboard
          canViewChats: ['admin', 'user', 'master'].includes(role),
          canManageAgents: ['admin', 'master'].includes(role),
          canManageCompany: ['admin', 'master'].includes(role),
          canAccessMaster: role === 'master',
          role,
          empresaName,
          userName: userData.nome_completo || null,
          userEmail: userData.email || null,
          loading: false
        };

        console.log('✅ Permissões definidas:', userPermissions);
        setPermissions(userPermissions);
      } catch (error) {
        console.error('❌ Erro ao buscar permissões:', error);
        setPermissions(prev => ({ 
          ...prev, 
          loading: false,
          role: null,
          empresaName: null,
          userName: null,
          userEmail: null
        }));
      }
    };

    fetchPermissions();
  }, []);

  return permissions;
}
