import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface LogActionParams {
  userId: string;
  empresaId?: number;
  acao: string;
  entidadeTipo: string;
  entidadeId: number;
  detalhes: any;
  req?: Request;
}

export async function logAction(params: LogActionParams) {
  const supabase = await createServerSupabaseClient();

  try {
    // Extract IP and User-Agent from request if available
    let ipAddress = 'unknown';
    let userAgent = 'unknown';

    if (params.req) {
      // Try to get IP from various headers
      const forwarded = params.req.headers.get('x-forwarded-for');
      const realIp = params.req.headers.get('x-real-ip');
      const cfConnectingIp = params.req.headers.get('cf-connecting-ip');
      
      ipAddress = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
      userAgent = params.req.headers.get('user-agent') || 'unknown';
    }

    const { error } = await supabase
      .from('auditoria')
      .insert({
        user_id: params.userId,
        empresa_id: params.empresaId || null,
        acao: params.acao,
        entidade_tipo: params.entidadeTipo,
        entidade_id: params.entidadeId,
        detalhes: params.detalhes,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Error logging action:', error);
      // Don't throw error to avoid breaking the main flow
    }
  } catch (error) {
    console.error('Error in logAction:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

// Helper functions for common actions
export async function logEmpresaAction(
  userId: string,
  empresaId: number,
  action: 'created' | 'updated' | 'suspended' | 'banned' | 'reactivated',
  details: any,
  req?: Request
) {
  await logAction({
    userId,
    empresaId,
    acao: `empresa_${action}`,
    entidadeTipo: 'empresa',
    entidadeId: empresaId,
    detalhes: details,
    req,
  });
}

export async function logUserAction(
  userId: string,
  targetUserId: number,
  empresaId: number,
  action: 'created' | 'updated' | 'suspended' | 'banned' | 'reactivated' | 'deleted',
  details: any,
  req?: Request
) {
  await logAction({
    userId,
    empresaId,
    acao: `user_${action}`,
    entidadeTipo: 'usuario',
    entidadeId: targetUserId,
    detalhes: details,
    req,
  });
}

export async function logAgenteAction(
  userId: string,
  agenteId: number,
  empresaId: number,
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated',
  details: any,
  req?: Request
) {
  await logAction({
    userId,
    empresaId,
    acao: `agente_${action}`,
    entidadeTipo: 'agente',
    entidadeId: agenteId,
    detalhes: details,
    req,
  });
}

export async function logPlanoAction(
  userId: string,
  planoId: number,
  empresaId: number,
  action: 'created' | 'updated' | 'deleted' | 'assigned',
  details: any,
  req?: Request
) {
  await logAction({
    userId,
    empresaId,
    acao: `plano_${action}`,
    entidadeTipo: 'plano',
    entidadeId: planoId,
    detalhes: details,
    req,
  });
}
