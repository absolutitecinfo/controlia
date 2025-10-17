import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const plano = searchParams.get('plano') || '';

    // Query base
    let query = supabase
      .from('empresas')
      .select(`
        id,
        nome,
        email,
        telefone,
        endereco,
        status,
        created_at,
        updated_at,
        planos (
          id,
          nome,
          preco_mensal
        ),
        perfis!empresa_id (
          id,
          status
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (plano) {
      query = query.eq('plano_id', plano);
    }

    const { data: empresas, error } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ error: 'Erro ao buscar empresas' }, { status: 500 });
    }

    // Processar dados para incluir contagem de usuários
    const empresasProcessadas = empresas.map(empresa => ({
      id: empresa.id,
      nome: empresa.nome,
      email: empresa.email,
      telefone: empresa.telefone,
      endereco: empresa.endereco,
      status: empresa.status,
      plano: empresa.planos,
      usuariosCount: empresa.perfis?.length || 0,
      usuariosAtivos: empresa.perfis?.filter((p: any) => p.status === 'ativo').length || 0,
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    }));

    return NextResponse.json(empresasProcessadas);
  } catch (error) {
    console.error('Master empresas GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    
    const { nome, email, telefone, endereco, plano_id } = await request.json();

    if (!nome || !email || !plano_id) {
      return NextResponse.json(
        { error: 'Nome, email e plano são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe empresa com este email
    const { data: existingEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmpresa) {
      return NextResponse.json(
        { error: 'Já existe uma empresa com este email' },
        { status: 400 }
      );
    }

    // Criar empresa
    const { data: novaEmpresa, error } = await supabase
      .from('empresas')
      .insert({
        nome,
        email,
        telefone,
        endereco,
        plano_id: parseInt(plano_id),
        status: 'ativa'
      })
      .select(`
        id,
        nome,
        email,
        telefone,
        endereco,
        status,
        created_at,
        planos (
          id,
          nome,
          preco_mensal
        )
      `)
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 });
    }

    return NextResponse.json(novaEmpresa, { status: 201 });
  } catch (error) {
    console.error('Master empresas POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
