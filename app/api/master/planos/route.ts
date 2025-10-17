import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();

    const { data: planos, error } = await supabase
      .from('planos')
      .select('*')
      .order('preco_mensal', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
    }

    return NextResponse.json(planos);
  } catch (error) {
    console.error('Master planos GET error:', error);
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
    
    const { 
      nome, 
      preco_mensal, 
      limite_usuarios, 
      max_agentes, 
      limite_mensagens_mes, 
      features, 
      is_popular,
      is_active = true 
    } = await request.json();

    if (!nome || preco_mensal === undefined) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe plano com este nome
    const { data: existingPlano } = await supabase
      .from('planos')
      .select('id')
      .eq('nome', nome)
      .single();

    if (existingPlano) {
      return NextResponse.json(
        { error: 'Já existe um plano com este nome' },
        { status: 400 }
      );
    }

    // Criar plano
    const { data: novoPlano, error } = await supabase
      .from('planos')
      .insert({
        nome,
        preco_mensal: parseFloat(preco_mensal),
        limite_usuarios: limite_usuarios ? parseInt(limite_usuarios) : null,
        max_agentes: max_agentes ? parseInt(max_agentes) : null,
        limite_mensagens_mes: limite_mensagens_mes ? parseInt(limite_mensagens_mes) : null,
        features: features || [],
        is_popular: is_popular || false,
        is_active
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return NextResponse.json({ error: 'Erro ao criar plano' }, { status: 500 });
    }

    return NextResponse.json(novoPlano, { status: 201 });
  } catch (error) {
    console.error('Master planos POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
