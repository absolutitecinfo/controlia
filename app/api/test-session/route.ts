import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('🔍 Testando sessão...');
    
    const supabase = await createServerSupabaseClient();
    
    // Verificar se há usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('📡 Usuário da sessão:', { 
      hasUser: !!user, 
      userId: user?.id,
      userError: userError?.message 
    });

    if (userError) {
      return NextResponse.json({ 
        error: 'Erro ao verificar usuário',
        details: userError.message 
      }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Nenhum usuário autenticado',
        session: null 
      }, { status: 401 });
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('perfis')
      .select('id, email, nome_completo, role, status, empresa_id')
      .eq('id', user.id)
      .single();

    console.log('📡 Perfil do usuário:', { 
      hasProfile: !!profile, 
      profileError: profileError?.message,
      role: profile?.role,
      status: profile?.status
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile || null,
      profileError: profileError?.message || null
    });

  } catch (error) {
    console.error('❌ Erro no teste de sessão:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
