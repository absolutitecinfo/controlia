import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    const { id } = params;

    const { data: empresa, error } = await supabase
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
          preco_mensal,
          limite_usuarios,
          max_agentes,
          limite_mensagens_mes,
          features
        ),
        perfis (
          id,
          nome_completo,
          email,
          role,
          status,
          created_at,
          last_sign_in_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Master empresa GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    const { id } = params;

    const { nome, email, telefone, endereco, status, plano_id } = await request.json();

    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (email !== undefined) updateData.email = email;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (status !== undefined) updateData.status = status;
    if (plano_id !== undefined) updateData.plano_id = parseInt(plano_id);

    const { data, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        nome,
        email,
        telefone,
        endereco,
        status,
        updated_at,
        planos (
          id,
          nome,
          preco_mensal
        )
      `)
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return NextResponse.json({ error: 'Erro ao atualizar empresa' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Master empresa PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();
    const { id } = params;

    // Verificar se a empresa tem usuários ativos
    const { data: usuarios, error: usuariosError } = await supabase
      .from('perfis')
      .select('id')
      .eq('empresa_id', id)
      .eq('status', 'ativo');

    if (usuariosError) {
      console.error('Error checking users:', usuariosError);
      return NextResponse.json({ error: 'Erro ao verificar usuários' }, { status: 500 });
    }

    if (usuarios && usuarios.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar empresa com usuários ativos' },
        { status: 400 }
      );
    }

    // Deletar empresa
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      return NextResponse.json({ error: 'Erro ao deletar empresa' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Empresa deletada com sucesso!' });
  } catch (error) {
    console.error('Master empresa DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
