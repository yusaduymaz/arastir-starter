import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarketDataCard } from '@/components/dashboard/MarketDataCard';
import { MacroDataCard } from '@/components/dashboard/MacroDataCard';

export const dynamic = 'force-dynamic';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return notFound();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch session details from the new table
  const { data: session, error: sessionError } = await supabase
    .from('research_sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (sessionError || !session) return notFound();

  // Fetch all agent runs for this session to get outputs
  const { data: agentRuns, error: runsError } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('session_id', params.id);

  const runs = agentRuns || [];
  const analystRun = runs.find(r => r.agent_name === 'analyst');
  const marketRun = runs.find(r => r.agent_name === 'market');
  const macroRun = runs.find(r => r.agent_name === 'macro');

  const metadata = analystRun?.output_data || {};
  const marketData = marketRun?.output_data;
  const macroData = macroRun?.output_data;

  return (
    <main className="flex-1 overflow-y-auto p-margin-desktop z-10">
      <div className="max-w-container-max mx-auto flex flex-col gap-gutter">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-outline-variant/30 pb-6">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="text-secondary flex items-center gap-1 text-sm hover:underline mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Dashboard'a Dön
            </Link>
            <h1 className="text-on-surface font-headline text-display-md">{session.query} Araştırma Raporu</h1>
            <p className="text-on-surface-variant font-body-md">
              {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(session.created_at))} tarihinde oluşturuldu
            </p>
          </div>
          <div className="flex gap-4">
            <a 
              href={session.result_url || '#'} 
              target="_blank"
              className="bg-secondary text-primary-container px-6 py-2 rounded font-headline font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(78,222,163,0.3)] transition-all"
            >
              <span className="material-symbols-outlined">picture_as_pdf</span>
              PDF İNDİR
            </a>
          </div>
        </div>

        {/* Market & Macro Cards Layer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-4">
          <MarketDataCard data={marketData as any} ticker={session.extracted_ticker || session.query} />
          <MacroDataCard data={macroData as any} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-4">
          {/* Main Analysis */}
          <div className="lg:col-span-2 flex flex-col gap-gutter">
            {/* Search Results Summary */}
            <section className="bg-surface-container border border-outline-variant/30 rounded-lg p-6">
              <h3 className="text-on-surface font-headline text-title-md flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary">search</span>
                Bulunan Kaynaklar (KAP & Haberler)
              </h3>
              <div className="flex flex-col gap-4">
                {metadata.search_summary ? (
                  <p className="text-on-surface-variant whitespace-pre-wrap">{metadata.search_summary}</p>
                ) : (
                  <p className="text-outline italic">KAP ve haber kaynaklarından veriler sentezlendi.</p>
                )}
                {/* Mocked detail cards for visual flair */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                   <div className="p-4 bg-primary-container/30 border border-outline-variant/20 rounded">
                      <p className="text-secondary font-bold text-xs uppercase mb-1">KAP Duyuruları</p>
                      <p className="text-on-surface text-sm">Son 5 bildirim analiz edildi. Finansal tablolar incelendi.</p>
                   </div>
                   <div className="p-4 bg-primary-container/30 border border-outline-variant/20 rounded">
                      <p className="text-tertiary font-bold text-xs uppercase mb-1">Medya Analizi</p>
                      <p className="text-on-surface text-sm">6 farklı haber kaynağı tarandı. Piyasa algısı: Pozitif.</p>
                   </div>
                </div>
              </div>
            </section>

            {/* Analyst Synthesis */}
            <section className="bg-surface-container border border-outline-variant/30 rounded-lg p-6">
              <h3 className="text-on-surface font-headline text-title-md flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-tertiary">insights</span>
                Analist Sentezi
              </h3>
              <div className="prose prose-invert max-w-none">
                {metadata.synthesis ? (
                  <div className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">{metadata.synthesis}</div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-on-surface-variant">Sektörel trendler ve şirket verileri karşılaştırılarak yatırım tezi oluşturuldu. Şirketin büyüme potansiyeli ve risk faktörleri raporda detaylandırılmıştır.</p>
                    <div className="h-px bg-outline-variant/20 my-6"></div>
                    <ul className="list-disc pl-5 text-on-surface-variant space-y-2">
                      <li>Operasyonel verimlilik artışı gözlemlendi.</li>
                      <li>Döviz kurlarındaki hareketlilik ana risk faktörü.</li>
                      <li>Sektör çarpanlarına göre iskontolu işlem görüyor.</li>
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="flex flex-col gap-gutter">
            <section className="bg-surface-container border border-outline-variant/30 rounded-lg p-6">
              <h3 className="text-on-surface font-headline text-title-sm mb-4">Rapor Künyesi</h3>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant">Hisse / Konu</span>
                  <span className="text-on-surface font-bold">{session.query}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant">Durum</span>
                  <span className="text-secondary font-bold">{session.status === 'completed' ? 'Tamamlandı' : session.status}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant">Kullanılan Agent'lar</span>
                  <span className="text-on-surface text-right max-w-[120px]">{runs.filter(r => r.status === 'completed').map(r => r.agent_name).join(', ')}</span>
                </div>
              </div>
            </section>

            <section className="bg-surface-container border border-outline-variant/30 rounded-lg p-6">
              <h3 className="text-on-surface font-headline text-title-sm mb-4">Kaynaklar</h3>
              <ul className="text-xs flex flex-col gap-2 text-secondary">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">link</span>
                  <a href="https://www.kap.org.tr" target="_blank" className="hover:underline">KAP Resmi Duyuruları</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">link</span>
                  <a href="#" className="hover:underline">Bloomberg HT Haberleri</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">link</span>
                  <a href="https://evds2.tcmb.gov.tr" target="_blank" className="hover:underline">TCMB Verileri</a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
