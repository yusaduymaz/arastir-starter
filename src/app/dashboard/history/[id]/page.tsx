import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, FileText, Presentation, ExternalLink, Calendar, Building, TrendingUp } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    return <div>Yetkisiz erişim. Lütfen giriş yapın.</div>;
  }

  // Initialize Supabase Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch report details
  const { data: report, error } = await supabase
    .from('research_history')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (error || !report) {
    return notFound();
  }

  const { kap_data, news_data, synthesis_data } = report;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <main className="flex-1 overflow-y-auto p-margin-desktop z-10 bg-background text-on-surface">
      <div className="max-w-container-max mx-auto flex flex-col gap-8">
        
        {/* Header & Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/history" className="p-2 bg-surface-container rounded-full border border-outline-variant hover:border-secondary hover:text-secondary transition-colors text-on-surface-variant">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight">{report.query} Araştırma Detayı</h2>
              <p className="text-on-surface-variant text-sm mt-1">Oluşturulma: {formatDate(report.created_at)}</p>
            </div>
          </div>

          {report.status === 'completed' && report.result_path && (
            <div className="flex gap-3">
              <a href={`${report.result_path}/report.pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-variant border border-outline-variant rounded-md text-sm font-medium transition-colors">
                <FileText size={16} className="text-blue-400" /> PDF İndir
              </a>
              <a href={`${report.result_path}/presentation.pptx`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-variant border border-outline-variant rounded-md text-sm font-medium transition-colors">
                <Presentation size={16} className="text-orange-400" /> Sunum İndir
              </a>
            </div>
          )}
        </div>

        {report.status !== 'completed' ? (
          <div className="p-12 text-center bg-surface-container border border-outline-variant rounded-xl">
            <p className="text-lg text-on-surface-variant">Bu rapor şu an '{report.status}' durumunda. Lütfen işlemin bitmesini bekleyin.</p>
            {report.error_message && <p className="text-red-400 mt-4 border border-red-900/50 bg-red-900/10 p-4 rounded">{report.error_message}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Synthesis & Stats */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-headline font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-secondary" size={20} /> Sentez Özeti
                </h3>
                {synthesis_data ? (
                  <div className="space-y-4">
                    {synthesis_data.data?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
                        <span className="text-on-surface-variant text-sm">{item.label}</span>
                        <span className="font-semibold text-lg">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">Sentez verisi bulunamadı.</p>
                )}
              </div>
            </div>

            {/* Right Column: KAP & News Details */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* KAP Data Section */}
              <div className="bg-surface-container border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-outline-variant/50 bg-surface-variant/20 flex items-center justify-between">
                  <h3 className="text-lg font-headline font-semibold flex items-center gap-2">
                    <Building className="text-primary" size={20} /> KAP Bildirimleri ({kap_data?.length || 0})
                  </h3>
                </div>
                <div className="divide-y divide-outline-variant/30 max-h-[400px] overflow-y-auto">
                  {kap_data && kap_data.length > 0 ? kap_data.map((kap: any, idx: number) => (
                    <div key={idx} className="p-5 hover:bg-surface-variant/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-primary-fixed">{kap.title}</h4>
                        <span className="text-xs text-on-surface-variant bg-surface-variant px-2 py-1 rounded whitespace-nowrap">{kap.date}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant line-clamp-3">{kap.content}</p>
                      <a href={kap.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary mt-3 hover:underline">
                        Orijinal Bildirime Git <ExternalLink size={12} />
                      </a>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-on-surface-variant">KAP verisi bulunamadı.</div>
                  )}
                </div>
              </div>

              {/* News Data Section */}
              <div className="bg-surface-container border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-outline-variant/50 bg-surface-variant/20 flex items-center justify-between">
                  <h3 className="text-lg font-headline font-semibold flex items-center gap-2">
                    <Calendar className="text-tertiary" size={20} /> Basından Haberler ({news_data?.length || 0})
                  </h3>
                </div>
                <div className="divide-y divide-outline-variant/30 max-h-[400px] overflow-y-auto">
                  {news_data && news_data.length > 0 ? news_data.map((news: any, idx: number) => (
                    <div key={idx} className="p-5 hover:bg-surface-variant/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{news.title}</h4>
                        <div className="flex gap-2 items-center">
                          {news.sentiment === 'positive' && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded">Olumlu</span>}
                          {news.sentiment === 'negative' && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded">Olumsuz</span>}
                          {news.sentiment === 'neutral' && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded">Nötr</span>}
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">{news.source} • {news.date}</p>
                      <p className="text-sm text-on-surface-variant line-clamp-3">{news.content}</p>
                      <a href={news.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary mt-3 hover:underline">
                        Haberi Oku <ExternalLink size={12} />
                      </a>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-on-surface-variant">Haber verisi bulunamadı.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}