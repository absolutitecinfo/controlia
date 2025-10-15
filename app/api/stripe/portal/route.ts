import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST() {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não configurado' },
        { status: 503 }
      );
    }

    const { profile } = await requireUser();
    const supabase = await createServerSupabaseClient();

    // Get empresa details
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('stripe_customer_id')
      .eq('id', profile.empresa_id)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    if (!empresa.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Customer não encontrado no Stripe' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: empresa.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão do portal' },
      { status: 500 }
    );
  }
}
