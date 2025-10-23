import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    const { data: usuario, error } = await supabase
      .from('perfis')
      .select(`
        internal_id,
        id,
        nome_completo,
        email,
        role,
        status,
        created_at,
        updated_at,
        ultimo_acesso
      `)
      .eq('internal_id', id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (error) {
      console.error('Error fetching usuario:', error);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Usuario GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;
    const body = await req.json();
    const { nome_completo, role, status } = body;

    // Verificar se o usuário pertence à empresa
    const { data: existingUser } = await supabase
      .from('perfis')
      .select('internal_id')
      .eq('internal_id', id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar perfil
    const updateData: any = {};
    if (nome_completo !== undefined) updateData.nome_completo = nome_completo;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('perfis')
      .update(updateData)
      .eq('internal_id', id)
      .eq('empresa_id', profile.empresa_id)
      .select(`
        internal_id,
        id,
        nome_completo,
        email,
        role,
        status,
        created_at,
        updated_at,
        ultimo_acesso
      `)
      .single();

    if (error) {
      console.error('Error updating usuario:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Usuario PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // Verificar se o usuário pertence à empresa
    const { data: existingUser } = await supabase
      .from('perfis')
      .select('internal_id, id')
      .eq('internal_id', id)
      .eq('empresa_id', profile.empresa_id)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Não permitir deletar a si mesmo (se tiver id do auth)
    if (existingUser.id && existingUser.id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar sua própria conta' },
        { status: 400 }
      );
    }

    // Deletar perfil
    const { error } = await supabase
      .from('perfis')
      .delete()
      .eq('internal_id', id)
      .eq('empresa_id', profile.empresa_id);

    if (error) {
      console.error('Error deleting usuario:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar usuário' },
        { status: 500 }
      );
    }

    // Se o usuário tinha um ID do auth, deletar também
    if (existingUser.id) {
      await supabase.auth.admin.deleteUser(existingUser.id);
    }

    return NextResponse.json({
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Usuario DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 401 }
    );
  }
}
