import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('🔍 Iniciando busca de usuários...');
    
    // Verificar autenticação
    const { profile } = await requireAdmin();
    console.log('✅ Profile obtido:', { empresa_id: profile.empresa_id, role: profile.role });
    
    const supabase = await createServerSupabaseClient();
    console.log('✅ Cliente Supabase criado');

    // Buscar usuários da empresa
    console.log('🔍 Buscando usuários da empresa:', profile.empresa_id);
    const { data: usuarios, error } = await supabase
      .from('perfis')
      .select(`
        id,
        nome_completo,
        email,
        role,
        status,
        created_at,
        updated_at,
        last_sign_in_at
      `)
      .eq('empresa_id', profile.empresa_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching usuarios:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuários', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Usuários encontrados:', usuarios?.length || 0);
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('❌ Usuarios GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const body = await req.json();
    const { email, nome_completo, role = 'colaborador' } = body;

    if (!email || !nome_completo) {
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe na tabela de perfis
    const { data: existingProfile } = await supabase
      .from('perfis')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'temp123456', // Senha temporária
    });

    if (authError || !authData.user) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Criar perfil do usuário
    const { data: perfilData, error: perfilError } = await supabase
      .from('perfis')
      .insert({
        id: authData.user.id,
        nome_completo,
        empresa_id: profile.empresa_id,
        role,
        status: 'ativo'
      })
      .select()
      .single();

    if (perfilError) {
      console.error('Error creating profile:', perfilError);
      // Tentar deletar o usuário criado no auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar perfil do usuário' },
        { status: 500 }
      );
    }

    // Enviar email de convite (opcional)
    // await supabase.auth.admin.inviteUserByEmail(email);

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: perfilData
    });
  } catch (error) {
    console.error('Usuarios POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
