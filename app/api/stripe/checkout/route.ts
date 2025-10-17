import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';

export async function POST(request: Request) {
  try {
    console.log('🔍 Iniciando checkout do Stripe...');
    const { user, profile } = await requireUser();
    console.log('✅ Usuário autenticado:', { userId: user.id, empresaId: profile.empresa_id });
    
    const supabase = await createServerSupabaseClient();
    console.log('✅ Cliente Supabase criado');

    const { plano_id } = await request.json();
    console.log('📋 Plano solicitado:', plano_id);

    if (!plano_id) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar informações do plano
    console.log('🔍 Buscando plano no banco...');
    const { data: plano, error: planoError } = await supabase
      .from('planos')
      .select('*')
      .eq('id', plano_id)
      .eq('is_active', true)
      .single();

    if (planoError || !plano) {
      console.error('❌ Erro ao buscar plano:', planoError);
      return NextResponse.json(
        { error: 'Plano não encontrado ou inativo' },
        { status: 404 }
      );
    }
    
    console.log('✅ Plano encontrado:', { id: plano.id, nome: plano.nome, preco: plano.preco_mensal });

    // Buscar informações da empresa
    console.log('🔍 Buscando empresa no banco...');
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', profile.empresa_id)
      .single();

    if (empresaError || !empresa) {
      console.error('❌ Erro ao buscar empresa:', empresaError);
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    console.log('✅ Empresa encontrada:', { id: empresa.id, nome: empresa.nome });

    // Verificar se o plano é gratuito
    if (plano.preco_mensal === 0) {
      // Atualizar empresa para o plano gratuito
      const { error: updateError } = await supabase
        .from('empresas')
        .update({
          plano_id: plano.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', empresa.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Erro ao atualizar plano' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Plano gratuito ativado com sucesso!',
        redirect_url: '/dashboard/subscription',
      });
    }

    // Verificar se o plano tem preço no Stripe
    if (!plano.stripe_price_id) {
      console.error('❌ Plano sem stripe_price_id:', plano.id);
      return NextResponse.json(
        { error: 'Plano não está sincronizado com o Stripe' },
        { status: 400 }
      );
    }
    
    console.log('✅ Plano tem stripe_price_id:', plano.stripe_price_id);

    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('❌ NEXT_PUBLIC_APP_URL não configurada');
      return NextResponse.json(
        { error: 'Configuração do ambiente incompleta' },
        { status: 500 }
      );
    }
    
    console.log('✅ NEXT_PUBLIC_APP_URL configurada:', process.env.NEXT_PUBLIC_APP_URL);

    // Criar sessão de checkout no Stripe
    console.log('🔍 Criando sessão de checkout no Stripe...');
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: plano.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`,
      metadata: {
        empresa_id: empresa.id,
        plano_id: plano.id,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          empresa_id: empresa.id,
          plano_id: plano.id,
        },
      },
    });

    console.log('✅ Sessão de checkout criada com sucesso:', session.id);
    return NextResponse.json({
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Erro no checkout do Stripe:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: error instanceof Error ? error.stack : 'Sem detalhes'
      },
      { status: 500 }
    );
  }
}