import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function trackMessageUsage(empresaId: number, tokensUsed: number = 0) {
  const supabase = await createServerSupabaseClient();
  const mesReferencia = new Date().toISOString().slice(0, 7) + '-01';

  try {
    // Insert or update usage record
    const { error } = await supabase
      .from('uso_recursos')
      .upsert({
        empresa_id: empresaId,
        mes_referencia: mesReferencia,
        mensagens_enviadas: 1,
        tokens_consumidos: tokensUsed,
      }, {
        onConflict: 'empresa_id,mes_referencia',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error tracking message usage:', error);
      throw error;
    }

    // Update the record to increment counters
    const { error: updateError } = await supabase.rpc('increment_usage', {
      p_empresa_id: empresaId,
      p_mes_referencia: mesReferencia,
      p_tokens: tokensUsed,
    });

    if (updateError) {
      console.error('Error incrementing usage:', updateError);
      // Fallback to manual update
      const { data: currentUsage } = await supabase
        .from('uso_recursos')
        .select('mensagens_enviadas, tokens_consumidos')
        .eq('empresa_id', empresaId)
        .eq('mes_referencia', mesReferencia)
        .single();

      if (currentUsage) {
        await supabase
          .from('uso_recursos')
          .update({
            mensagens_enviadas: currentUsage.mensagens_enviadas + 1,
            tokens_consumidos: currentUsage.tokens_consumidos + tokensUsed,
            updated_at: new Date().toISOString(),
          })
          .eq('empresa_id', empresaId)
          .eq('mes_referencia', mesReferencia);
      }
    }
  } catch (error) {
    console.error('Error in trackMessageUsage:', error);
    throw error;
  }
}

export async function checkMessageLimit(empresaId: number): Promise<{ allowed: boolean; remaining: number; limit: number | null }> {
  const supabase = await createServerSupabaseClient();
  const mesReferencia = new Date().toISOString().slice(0, 7) + '-01';

  try {
    // Get plan limit
    const { data: empresa } = await supabase
      .from('empresas')
      .select('planos(limite_mensagens_mes)')
      .eq('id', empresaId)
      .single();

    const limit = empresa?.planos?.[0]?.limite_mensagens_mes;

    if (!limit) {
      return { allowed: true, remaining: -1, limit: null }; // Unlimited
    }

    // Get current usage
    const { data: uso } = await supabase
      .from('uso_recursos')
      .select('mensagens_enviadas')
      .eq('empresa_id', empresaId)
      .eq('mes_referencia', mesReferencia)
      .single();

    const used = uso?.mensagens_enviadas || 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: used < limit,
      remaining,
      limit,
    };
  } catch (error) {
    console.error('Error checking message limit:', error);
    return { allowed: false, remaining: 0, limit: 0 };
  }
}

export async function checkAgentLimit(empresaId: number): Promise<{ allowed: boolean; remaining: number; limit: number | null }> {
  const supabase = await createServerSupabaseClient();

  try {
    // Get plan limit
    const { data: empresa } = await supabase
      .from('empresas')
      .select('planos(max_agentes)')
      .eq('id', empresaId)
      .single();

    const limit = empresa?.planos?.[0]?.max_agentes;

    if (!limit) {
      return { allowed: true, remaining: -1, limit: null }; // Unlimited
    }

    // Get current active agents
    const { count: activeAgents } = await supabase
      .from('agentes_ia')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('is_active', true);

    const used = activeAgents || 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: used < limit,
      remaining,
      limit,
    };
  } catch (error) {
    console.error('Error checking agent limit:', error);
    return { allowed: false, remaining: 0, limit: 0 };
  }
}

export async function checkUserLimit(empresaId: number): Promise<{ allowed: boolean; remaining: number; limit: number | null }> {
  const supabase = await createServerSupabaseClient();

  try {
    // Get plan limit
    const { data: empresa } = await supabase
      .from('empresas')
      .select('planos(max_usuarios)')
      .eq('id', empresaId)
      .single();

    const limit = empresa?.planos?.[0]?.max_usuarios;

    if (!limit) {
      return { allowed: true, remaining: -1, limit: null }; // Unlimited
    }

    // Get current active users
    const { count: activeUsers } = await supabase
      .from('perfis')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('status', 'ativo');

    const used = activeUsers || 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: used < limit,
      remaining,
      limit,
    };
  } catch (error) {
    console.error('Error checking user limit:', error);
    return { allowed: false, remaining: 0, limit: 0 };
  }
}
