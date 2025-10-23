import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fazer logout no servidor
    await supabase.auth.signOut();
    
    // Retornar resposta de sucesso
    const response = NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso' },
      { status: 200 }
    );
    
    // Limpar todos os cookies relacionados ao Supabase
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    return response;
  } catch (error) {
    console.error('Erro no logout do servidor:', error);
    
    // Mesmo com erro, retornar sucesso para garantir que o cliente redirecione
    return NextResponse.json(
      { success: true, message: 'Logout processado' },
      { status: 200 }
    );
  }
}

