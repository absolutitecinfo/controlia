import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST() {
  try {
    console.log('Starting Stripe sync...');
    console.log('Stripe Secret Key available:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Stripe Secret Key prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');
    
    await requireMaster();
    console.log('Master authentication successful');
    
    const supabase = await createServerSupabaseClient();
    console.log('Supabase client created');

    // Buscar todos os planos ativos
    const { data: planos, error: planosError } = await supabase
      .from('planos')
      .select('*')
      .eq('is_active', true);

    if (planosError) {
      console.error('Error fetching plans:', planosError);
      return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
    }

    console.log(`Found ${planos?.length || 0} active plans to sync`);

    // Test Stripe connection
    try {
      console.log('Testing Stripe connection...');
      const testProduct = await stripe.products.list({ limit: 1 });
      console.log('Stripe connection successful, found', testProduct.data.length, 'existing products');
    } catch (stripeError) {
      console.error('Stripe connection failed:', stripeError);
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error';
      return NextResponse.json(
        { error: `Stripe connection failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    const results = [];

    for (const plano of planos) {
      try {
        console.log(`Processing plan: ${plano.nome} (ID: ${plano.id})`);
        
        // Verificar se já existe um produto no Stripe para este plano
        let stripeProduct;
        let stripePrice;

        if (plano.stripe_product_id) {
          console.log(`Plan ${plano.nome} already has Stripe product: ${plano.stripe_product_id}`);
          // Buscar produto existente
          stripeProduct = await stripe.products.retrieve(plano.stripe_product_id);
        } else {
          console.log(`Creating new Stripe product for plan: ${plano.nome}`);
          // Criar novo produto no Stripe
          stripeProduct = await stripe.products.create({
            name: plano.nome,
            description: `Plano ${plano.nome} da ControlIA`,
            metadata: {
              plano_id: plano.id,
              limite_usuarios: plano.max_usuarios?.toString() || '0',
              max_agentes: plano.max_agentes?.toString() || '0',
              limite_mensagens_mes: plano.limite_mensagens_mes?.toString() || '0',
            },
          });
          console.log(`Created Stripe product: ${stripeProduct.id}`);
        }

        // Criar ou atualizar preço no Stripe
        if (plano.preco_mensal > 0) {
          console.log(`Creating price for plan ${plano.nome}: R$ ${plano.preco_mensal}`);
          // Criar novo preço (Stripe não permite editar preços existentes)
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(plano.preco_mensal * 100), // Converter para centavos
            currency: 'usd', // Temporariamente usando USD para teste
            recurring: {
              interval: 'month',
            },
            metadata: {
              plano_id: plano.id,
            },
          });
          console.log(`Created Stripe price: ${stripePrice.id}`);
        } else {
          console.log(`Plan ${plano.nome} has no price (preco_mensal: ${plano.preco_mensal})`);
        }

        // Atualizar plano no banco com IDs do Stripe
        const updateData: any = {
          stripe_product_id: stripeProduct.id,
          updated_at: new Date().toISOString(),
        };

        if (stripePrice) {
          updateData.stripe_price_id = stripePrice.id;
        }

        const { error: updateError } = await supabase
          .from('planos')
          .update(updateData)
          .eq('id', plano.id);

        if (updateError) {
          console.error('Error updating plan:', updateError);
          const errorMessage = updateError instanceof Error ? updateError.message : 'Unknown error';
          results.push({
            plano_id: plano.id,
            plano_nome: plano.nome,
            status: 'error',
            error: errorMessage,
          });
        } else {
          results.push({
            plano_id: plano.id,
            plano_nome: plano.nome,
            status: 'success',
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice?.id || null,
          });
        }
      } catch (stripeError: any) {
        console.error('Stripe error for plan:', plano.nome, stripeError);
        const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error';
        results.push({
          plano_id: plano.id,
          plano_nome: plano.nome,
          status: 'error',
          error: errorMessage,
        });
      }
    }

    return NextResponse.json({
      message: 'Sincronização concluída',
      results,
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
