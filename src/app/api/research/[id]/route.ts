import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const reportId = params.id;
    if (!reportId) {
      return NextResponse.json({ error: 'Rapor ID gerekli' }, { status: 400 });
    }

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Sunucu yapılandırma hatası' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // İlk olarak raporun bu kullanıcıya ait olup olmadığını kontrol et
    const { data: record, error: fetchError } = await supabase
      .from('research_history')
      .select('user_id')
      .eq('id', reportId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: 'Rapor bulunamadı' }, { status: 404 });
    }

    if (record.user_id !== userId) {
      return NextResponse.json({ error: 'Bu raporu silme yetkiniz yok' }, { status: 403 });
    }

    // Raporu sil
    const { error: deleteError } = await supabase
      .from('research_history')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Rapor silinirken veritabanı hatası oluştu' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
