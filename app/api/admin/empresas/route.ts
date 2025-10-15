import { NextRequest, NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('empresas')
      .select(`
        *,
        planos (
          nome,
          preco_mensal,
          max_usuarios,
          max_agentes,
          limite_mensagens_mes
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: empresas, error, count } = await query;

    if (error) {
      console.error('Error fetching empresas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar empresas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      empresas,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin empresas GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireMaster();
    const supabase = await createServerSupabaseClient();

    const body = await req.json();
    const { nome, email, telefone, endereco, plano_id } = body;

    if (!nome || !email || !plano_id) {
      return NextResponse.json(
        { error: 'Nome, email e plano são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmpresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmpresa) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Create empresa
    const { data: empresa, error } = await supabase
      .from('empresas')
      .insert({
        nome,
        email,
        telefone: telefone || null,
        endereco: endereco || null,
        plano_id: parseInt(plano_id),
        status: 'ativo',
        data_adesao: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating empresa:', error);
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      );
    }

    // Log action
    await supabase
      .from('auditoria')
      .insert({
        user_id: user.id,
        empresa_id: empresa.id,
        acao: 'empresa_created',
        entidade_tipo: 'empresa',
        entidade_id: empresa.id,
        detalhes: {
          nome: empresa.nome,
          email: empresa.email,
          plano_id: empresa.plano_id,
        },
      });

    return NextResponse.json(empresa, { status: 201 });
  } catch (error) {
    console.error('Admin empresas POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
