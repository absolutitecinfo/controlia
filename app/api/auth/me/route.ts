import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();

    // Buscar informações da empresa se não for master
    let empresaName = null;
    if (profile.role !== 'master') {
      const { data: empresa } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', profile.empresa_id)
        .single();
      
      empresaName = empresa?.nome || null;
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: profile.role,
      status: profile.status,
      empresaName,
      empresaId: profile.empresa_id
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
