import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('API /api/auth/me: Iniciando...');
    
    const { user, profile } = await requireUser();
    console.log('API /api/auth/me: Usuário autenticado:', user.id);
    console.log('API /api/auth/me: Perfil:', profile);
    
    const supabase = await createServerSupabaseClient();

    // Buscar informações da empresa se não for master
    let empresaName = null;
    if (profile.role !== 'master') {
      console.log('API /api/auth/me: Buscando empresa para role:', profile.role);
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', profile.empresa_id)
        .single();
      
      if (empresaError) {
        console.error('API /api/auth/me: Erro ao buscar empresa:', empresaError);
      } else {
        console.log('API /api/auth/me: Empresa encontrada:', empresa);
      }
      
      empresaName = empresa?.nome || null;
    }

    const responseData = {
      id: user.id,
      email: user.email,
      role: profile.role,
      status: profile.status,
      empresaName,
      empresaId: profile.empresa_id,
      nome_completo: profile.nome_completo
    };

    console.log('API /api/auth/me: Dados de resposta:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API /api/auth/me: Erro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
