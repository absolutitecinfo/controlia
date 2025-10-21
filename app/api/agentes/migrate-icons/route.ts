import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const { profile } = await requireAdmin();
    const supabase = await createServerSupabaseClient();

    // Backfill: copy icone_url -> icone when icone is null
    const { error } = await supabase
      .from('agentes_ia')
      .update({ icone: supabase.rpc as any }) as any;

    // Supabase update above isn't valid with expression; do it in two steps
    const { data: rows, error: fetchError } = await supabase
      .from('agentes_ia')
      .select('id, icone, icone_url')
      .eq('empresa_id', profile.empresa_id);

    if (fetchError) throw fetchError;

    const updates = rows
      .filter((r: any) => !r.icone && r.icone_url)
      .map((r: any) => ({ id: r.id, icone: r.icone_url }));

    for (const u of updates) {
      const { error: upErr } = await supabase
        .from('agentes_ia')
        .update({ icone: u.icone })
        .eq('id', u.id)
        .eq('empresa_id', profile.empresa_id);
      if (upErr) throw upErr;
    }

    return NextResponse.json({ migrated: updates.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro na migração' }, { status: 500 });
  }
}


