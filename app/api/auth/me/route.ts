import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('🔍 /api/auth/me - Iniciando...');
    
    const { user, profile } = await requireUser();
    console.log('✅ Usuário autenticado:', { userId: user.id, role: profile.role });
    
    const supabase = await createServerSupabaseClient();

    // Buscar informações da empresa se não for master
    let empresaName = null;
    if (profile.role !== 'master' && profile.empresa_id) {
      console.log('🔍 Buscando empresa:', profile.empresa_id);
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', profile.empresa_id)
        .single();
      
      if (empresaError) {
        console.error('❌ Erro ao buscar empresa:', empresaError);
      } else {
        console.log('✅ Empresa encontrada:', empresa?.nome);
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

    console.log('✅ Dados do usuário preparados:', { 
      role: responseData.role, 
      empresaName: responseData.empresaName 
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Auth me error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
