import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook signature missing' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { empresa_id, plano_id } = session.metadata || {};

        if (empresa_id && plano_id) {
          // Update empresa with subscription
          await supabase
            .from('empresas')
            .update({
              stripe_subscription_id: session.subscription as string,
              plano_id: parseInt(plano_id),
              status: 'ativo',
              proxima_cobranca: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            })
            .eq('id', empresa_id);

          // Log action
          await supabase
            .from('auditoria')
            .insert({
              empresa_id: parseInt(empresa_id),
              user_id: session.metadata?.user_id,
              acao: 'checkout_completed',
              entidade_tipo: 'empresa',
              entidade_id: parseInt(empresa_id),
              detalhes: {
                plano_id: parseInt(plano_id),
                session_id: session.id,
                subscription_id: session.subscription,
              },
            });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const { empresa_id } = subscription.metadata || {};

        if (empresa_id) {
          // Update next billing date
          await supabase
            .from('empresas')
            .update({
              proxima_cobranca: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
              status: 'ativo',
            })
            .eq('stripe_subscription_id', subscription.id);

          // Log action
          await supabase
            .from('auditoria')
            .insert({
              empresa_id: parseInt(empresa_id),
              acao: 'payment_succeeded',
              entidade_tipo: 'empresa',
              entidade_id: parseInt(empresa_id),
              detalhes: {
                invoice_id: invoice.id,
                amount_paid: invoice.amount_paid,
                next_billing: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
              },
            });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const { empresa_id } = subscription.metadata || {};

        if (empresa_id) {
          // Mark empresa as overdue
          await supabase
            .from('empresas')
            .update({
              status: 'em_atraso',
            })
            .eq('stripe_subscription_id', subscription.id);

          // Log action
          await supabase
            .from('auditoria')
            .insert({
              empresa_id: parseInt(empresa_id),
              acao: 'payment_failed',
              entidade_tipo: 'empresa',
              entidade_id: parseInt(empresa_id),
              detalhes: {
                invoice_id: invoice.id,
                amount_due: invoice.amount_due,
                attempt_count: invoice.attempt_count,
              },
            });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { empresa_id } = subscription.metadata || {};

        if (empresa_id) {
          // Suspend empresa
          await supabase
            .from('empresas')
            .update({
              status: 'suspenso',
              stripe_subscription_id: null,
            })
            .eq('stripe_subscription_id', subscription.id);

          // Log action
          await supabase
            .from('auditoria')
            .insert({
              empresa_id: parseInt(empresa_id),
              acao: 'subscription_canceled',
              entidade_tipo: 'empresa',
              entidade_id: parseInt(empresa_id),
              detalhes: {
                subscription_id: subscription.id,
                canceled_at: new Date(subscription.canceled_at * 1000).toISOString(),
              },
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const { empresa_id, plano_id } = subscription.metadata || {};

        if (empresa_id && plano_id) {
          // Update plano
          await supabase
            .from('empresas')
            .update({
              plano_id: parseInt(plano_id),
              status: subscription.status === 'active' ? 'ativo' : 'suspenso',
            })
            .eq('stripe_subscription_id', subscription.id);

          // Log action
          await supabase
            .from('auditoria')
            .insert({
              empresa_id: parseInt(empresa_id),
              acao: 'subscription_updated',
              entidade_tipo: 'empresa',
              entidade_id: parseInt(empresa_id),
              detalhes: {
                subscription_id: subscription.id,
                new_plano_id: parseInt(plano_id),
                status: subscription.status,
              },
            });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
