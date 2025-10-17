import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('🔍 Testando conexão com banco...');
    
    const supabase = await createServerSupabaseClient();
    console.log('✅ Cliente Supabase criado');

    // Teste simples: buscar uma tabela
    console.log('🔍 Testando query simples...');
    const { data, error } = await supabase
      .from('perfis')
      .select('id, nome_completo')
      .limit(5);

    if (error) {
      console.error('❌ Error na query:', error);
      return NextResponse.json(
        { error: 'Erro na query', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Query executada com sucesso:', data?.length || 0, 'registros');
    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      data: data 
    });
  } catch (error) {
    console.error('❌ Test DB error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
