import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Não autenticado');
  }
  
  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const supabase = await createServerSupabaseClient();
  
  const { data: profile } = await supabase
    .from('perfis')
    .select('role, status, empresa_id, empresas(status)')
    .eq('id', user.id)
    .single();
  
  if (!profile) {
    throw new Error('Perfil não encontrado');
  }
  
  if (profile.status !== 'ativo') {
    throw new Error('Usuário suspenso');
  }
  
  if (profile.empresas?.status !== 'ativo') {
    throw new Error('Empresa suspensa');
  }
  
  if (!allowedRoles.includes(profile.role)) {
    throw new Error('Sem permissão');
  }
  
  return { user, profile };
}

export async function requireAdmin() {
  return requireRole(['admin', 'master']);
}

export async function requireMaster() {
  return requireRole(['master']);
}

export async function requireUser() {
  return requireRole(['user', 'admin', 'master']);
}

// Helper function to create error response
export function createErrorResponse(message: string, status: number = 401) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// Helper function to validate empresa_id access
export async function validateEmpresaAccess(empresaId: string, userProfile: any) {
  // Master can access any empresa
  if (userProfile.role === 'master') {
    return true;
  }
  
  // Admin and user can only access their own empresa
  return userProfile.empresa_id === parseInt(empresaId);
}
