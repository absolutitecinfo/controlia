import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('perfis')
      .select('role, status, empresa_id, nome_completo')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      profile: profile || null,
      profileError: profileError?.message || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
