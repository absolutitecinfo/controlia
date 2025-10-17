import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST() {
  try {
    const { user, profile } = await requireUser();
    const supabase = await createServerSupabaseClient();

    // Buscar informações da empresa
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', profile.empresa_id)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a empresa tem uma assinatura ativa no Stripe
    if (!empresa.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 404 }
      );
    }

    // Criar sessão do portal de cobrança
    const session = await stripe.billingPortal.sessions.create({
      customer: empresa.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}