import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(req: NextRequest) {
  try {
    const { user, profile } = await requireAuth();
    const supabase = await createServerSupabaseClient();

    const body = await req.json();
    const { planoId } = body;

    if (!planoId) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      );
    }

    // Get plano details
    const { data: plano, error: planoError } = await supabase
      .from('planos')
      .select('*')
      .eq('id', planoId)
      .single();

    if (planoError || !plano) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    if (!plano.stripe_price_id) {
      return NextResponse.json(
        { error: 'Plano não configurado no Stripe' },
        { status: 400 }
      );
    }

    // Get empresa details
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

    let customerId = empresa.stripe_customer_id;

    // Create or get Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: empresa.email,
        name: empresa.nome,
        metadata: {
          empresa_id: empresa.id.toString(),
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Update empresa with customer ID
      await supabase
        .from('empresas')
        .update({ stripe_customer_id: customerId })
        .eq('id', empresa.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plano.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      metadata: {
        empresa_id: empresa.id.toString(),
        plano_id: planoId.toString(),
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          empresa_id: empresa.id.toString(),
          plano_id: planoId.toString(),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    );
  }
}
