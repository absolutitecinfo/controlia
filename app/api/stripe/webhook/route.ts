import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          // Atualizar empresa com informações da assinatura
          await supabase
            .from('empresas')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              plano_id: session.metadata?.plano_id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.metadata?.empresa_id);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Buscar empresa pela subscription ID
        const { data: empresa } = await supabase
          .from('empresas')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (empresa) {
          await supabase
            .from('empresas')
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq('id', empresa.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Buscar empresa pela subscription ID
        const { data: empresa } = await supabase
          .from('empresas')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (empresa) {
          // Buscar plano gratuito
          const { data: planoGratuito } = await supabase
            .from('planos')
            .select('id')
            .eq('preco_mensal', 0)
            .eq('is_active', true)
            .single();

          await supabase
            .from('empresas')
            .update({
              stripe_subscription_id: null,
              plano_id: planoGratuito?.id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', empresa.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Buscar empresa pela subscription ID
          const { data: empresa } = await supabase
            .from('empresas')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single();

          if (empresa) {
            await supabase
              .from('empresas')
              .update({
                updated_at: new Date().toISOString(),
              })
              .eq('id', empresa.id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Buscar empresa pela subscription ID
          const { data: empresa } = await supabase
            .from('empresas')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single();

          if (empresa) {
            // Aqui você pode implementar lógica para notificar sobre falha no pagamento
            console.log('Payment failed for empresa:', empresa.id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}