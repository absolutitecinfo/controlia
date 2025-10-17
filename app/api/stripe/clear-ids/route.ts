import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    console.log('Clearing Stripe IDs from database...');
    await requireMaster();
    const supabase = await createServerSupabaseClient();

    // Limpar todos os IDs do Stripe dos planos
    const { error } = await supabase
      .from('planos')
      .update({
        stripe_product_id: null,
        stripe_price_id: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', 0); // Atualizar todos os planos

    if (error) {
      console.error('Error clearing Stripe IDs:', error);
      return NextResponse.json({ error: 'Erro ao limpar IDs do Stripe' }, { status: 500 });
    }

    console.log('Stripe IDs cleared successfully');
    return NextResponse.json({
      message: 'IDs do Stripe limpos com sucesso. Agora você pode sincronizar novamente.',
      success: true
    });
  } catch (error: any) {
    console.error('Clear Stripe IDs error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
