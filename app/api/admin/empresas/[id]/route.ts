import { NextRequest, NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireMaster();
    const supabase = await createServerSupabaseClient();

    const { data: empresa, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error || !empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Admin empresa GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireMaster();
    const supabase = await createServerSupabaseClient();

    const body = await req.json();
    const { nome, email, telefone, endereco, plano_id, status, chave_api_llm, contexto_ia } = body;

    // Check if empresa exists
    const { data: existingEmpresa } = await supabase
      .from('empresas')
      .select('id, nome, email')
      .eq('id', params.id)
      .single();

    if (!existingEmpresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== existingEmpresa.email) {
      const { data: emailExists } = await supabase
        .from('empresas')
        .select('id')
        .eq('email', email)
        .neq('id', params.id)
        .single();

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (nome !== undefined) updateData.nome = nome;
    if (email !== undefined) updateData.email = email;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (plano_id !== undefined) updateData.plano_id = parseInt(plano_id);
    if (status !== undefined) updateData.status = status;
    if (chave_api_llm !== undefined) updateData.chave_api_llm = chave_api_llm;
    if (contexto_ia !== undefined) updateData.contexto_ia = contexto_ia;

    updateData.updated_at = new Date().toISOString();

    const { data: empresa, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating empresa:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar empresa' },
        { status: 500 }
      );
    }

    // Log action
    await supabase
      .from('auditoria')
      .insert({
        user_id: user.id,
        empresa_id: parseInt(params.id),
        acao: 'empresa_updated',
        entidade_tipo: 'empresa',
        entidade_id: parseInt(params.id),
        detalhes: {
          changes: updateData,
          previous: existingEmpresa,
        },
      });

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Admin empresa PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireMaster();
    const supabase = await createServerSupabaseClient();

    // Check if empresa exists
    const { data: empresa } = await supabase
      .from('empresas')
      .select('id, nome, email')
      .eq('id', params.id)
      .single();

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Check if empresa has users
    const { data: users } = await supabase
      .from('perfis')
      .select('id')
      .eq('empresa_id', params.id)
      .limit(1);

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma empresa que possui usuários' },
        { status: 400 }
      );
    }

    // Delete empresa
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting empresa:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar empresa' },
        { status: 500 }
      );
    }

    // Log action
    await supabase
      .from('auditoria')
      .insert({
        user_id: user.id,
        empresa_id: parseInt(params.id),
        acao: 'empresa_deleted',
        entidade_tipo: 'empresa',
        entidade_id: parseInt(params.id),
        detalhes: {
          nome: empresa.nome,
          email: empresa.email,
        },
      });

    return NextResponse.json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Admin empresa DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
