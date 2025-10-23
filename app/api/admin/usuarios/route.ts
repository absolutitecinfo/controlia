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

    // Buscar usuários da empresa com query mais simples
    console.log('🔍 Buscando usuários da empresa:', profile.empresa_id);
    const { data: usuarios, error } = await supabase
      .from('perfis')
      .select('id, nome_completo, email, role, status, created_at, updated_at, ultimo_acesso')
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
    return NextResponse.json(usuarios || []);
  } catch (error) {
    console.error('❌ Usuarios GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Iniciando criação de usuário...');
    
    const { profile } = await requireAdmin();
    console.log('✅ Profile obtido:', { empresa_id: profile.empresa_id, role: profile.role });
    
    const body = await req.json();
    const { email, nome_completo, role = 'user' } = body;

    console.log('📝 Dados recebidos:', { email, nome_completo, role });

    if (!email || !nome_completo) {
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Por enquanto, vamos simular a criação de usuário
    // Em uma implementação real, você precisaria:
    // 1. Aplicar a migration 012_allow_pending_users.sql
    // 2. Ou implementar um sistema de convites por email
    
    console.log('✅ Simulando criação de usuário');

    const mockUser = {
      id: crypto.randomUUID(),
      email,
      nome_completo,
      role,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Usuário criado com sucesso! (Simulação - implementação completa requer migration)',
      user: mockUser
    });
  } catch (error) {
    console.error('❌ Usuarios POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
