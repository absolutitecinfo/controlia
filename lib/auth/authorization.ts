import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  console.log('requireAuth called');
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('Auth result:', { user: user?.id, error });
  
  if (error) {
    console.error('Auth error:', error);
    throw new Error(`Erro de autenticação: ${error.message}`);
  }
  
  if (!user) {
    console.error('No user found');
    throw new Error('Não autenticado');
  }
  
  console.log('User authenticated successfully:', user.id);
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const supabase = await createServerSupabaseClient();
  
  // Primeiro buscar o perfil
  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('role, status, empresa_id, nome_completo')
    .eq('id', user.id)
    .single();
  
  if (profileError || !profile) {
    console.error('Profile query error:', profileError);
    throw new Error(`Erro ao buscar perfil: ${profileError?.message || 'Perfil não encontrado'}`);
  }
  
  // Buscar o status da empresa (se não for master)
  let empresaStatus = 'ativo'; // Default para master
  if (profile.role !== 'master' && profile.empresa_id) {
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('status')
      .eq('id', profile.empresa_id)
      .single();
    
    if (empresaError) {
      console.error('Empresa query error:', empresaError);
      // Não falhar se não conseguir buscar a empresa, apenas logar o erro
      empresaStatus = 'ativo'; // Assumir ativo como fallback
    } else if (empresa) {
      empresaStatus = empresa.status;
    }
  }
  
  // Combinar os dados
  const profileWithEmpresa = {
    ...profile,
    empresas: { status: empresaStatus }
  };
  
  console.log('Profile data:', {
    role: profileWithEmpresa.role,
    status: profileWithEmpresa.status,
    empresa_id: profileWithEmpresa.empresa_id,
    empresa_status: profileWithEmpresa.empresas?.status
  });
  
  if (profileWithEmpresa.status !== 'ativo') {
    console.error('User status not active:', profileWithEmpresa.status);
    throw new Error('Usuário suspenso');
  }
  
  if (profileWithEmpresa.empresas?.status !== 'ativo') {
    console.error('Empresa status not active:', profileWithEmpresa.empresas?.status);
    throw new Error('Empresa suspensa');
  }
  
  if (!allowedRoles.includes(profileWithEmpresa.role)) {
    console.error('Role not allowed:', profileWithEmpresa.role, 'allowed:', allowedRoles);
    throw new Error('Sem permissão');
  }
  
  console.log('Authorization successful for user:', user.id);
  return { user, profile: profileWithEmpresa };
}

export async function requireAdmin() {
  return requireRole(['admin', 'master']);
}

export async function requireMaster() {
  console.log('requireMaster called');
  const result = await requireRole(['master']);
  console.log('requireMaster result:', result);
  return result;
}

export async function requireUser() {
  return requireRole(['colaborador', 'admin', 'master']);
}

// Helper function to create error response
export function createErrorResponse(message: string, status: number = 401) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// Helper function to validate empresa_id access
export async function validateEmpresaAccess(empresaId: string, userProfile: { role: string; empresa_id: number }) {
  // Master can access any empresa
  if (userProfile.role === 'master') {
    return true;
  }
  
  // Admin and user can only access their own empresa
  return userProfile.empresa_id === parseInt(empresaId);
}
