import React from 'react';

const DashboardPage = () => {
  return (
    <main className="flex-1 overflow-y-auto p-margin-desktop z-10">
      <div className="max-w-container-max mx-auto flex flex-col gap-gutter">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Stat Card 1 */}
          <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col gap-2">
                <p className="text-on-surface-variant font-body-md">Toplam Tasarruf Edilen Süre</p>
                <p className="text-on-surface font-headline text-display-lg">120 <span className="text-title-md text-secondary">Saat</span></p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-secondary border border-outline-variant">
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>
          </div>
          {/* Stat Card 2 */}
          <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col gap-2">
                <p className="text-on-surface-variant font-body-md">Oluşturulan Raporlar</p>
                <p className="text-on-surface font-headline text-display-lg">45</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-tertiary border border-outline-variant">
                <span className="material-symbols-outlined">description</span>
              </div>
            </div>
          </div>
          {/* Stat Card 3 */}
          <div className="bg-surface-container border-l-4 border-secondary border-t border-b border-r border-outline-variant/30 border-t-outline-variant/30 border-b-outline-variant/30 border-r-outline-variant/30 rounded-lg p-6 relative overflow-hidden shadow-[inset_40px_0_40px_-40px_rgba(78,222,163,0.05)]">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex flex-col gap-2">
                <p className="text-on-surface-variant font-body-md">Aktif Analizler</p>
                <p className="text-on-surface font-headline text-display-lg text-secondary">3</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-secondary border border-outline-variant">
                <span className="material-symbols-outlined">analytics</span>
              </div>
            </div>
          </div>
        </div>
        {/* Active Pipeline Section */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
          <div className="flex justify-between items-center">
            <h3 className="text-on-surface font-headline text-title-md flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">memory</span>
              Aktif Analiz Süreci: <span className="text-on-surface-variant font-normal">Finansal Teknoloji Sektörü 2024</span>
            </h3>
            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded font-label-sm uppercase tracking-wider border border-secondary/20">Devam Ediyor</span>
          </div>
          {/* Pipeline Stages */}
          <div className="flex items-center justify-between relative mt-4">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary-container -translate-y-1/2 z-0"></div>
            <div className="absolute top-1/2 left-0 w-[35%] h-[2px] bg-secondary -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(78,222,163,0.5)]"></div>
            {/* Stage 1: Search */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary-container shadow-[0_0_15px_rgba(78,222,163,0.4)]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
              </div>
              <p className="text-on-surface font-headline font-semibold text-sm">Search Agent</p>
              <p className="text-secondary font-label-sm">Tamamlandı</p>
            </div>
            {/* Stage 2: Validation (Active) */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className="relative h-12 w-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-secondary opacity-20 animate-ping"></div>
                <div className="relative h-12 w-12 rounded-full bg-primary-container border-2 border-secondary flex items-center justify-center text-secondary bg-surface-container">
                  <span className="material-symbols-outlined">rule</span>
                </div>
              </div>
              <p className="text-on-surface font-headline font-semibold text-sm">Validation Agent</p>
              <p className="text-secondary font-label-sm">Çalışıyor (50%)</p>
            </div>
            {/* Stage 3: Analyst */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className="h-12 w-12 rounded-full bg-primary-container border border-outline-variant flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <p className="text-on-surface-variant font-headline font-semibold text-sm">Analyst Agent</p>
              <p className="text-outline font-label-sm">Bekliyor</p>
            </div>
            {/* Stage 4: Writer */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-1/4">
              <div className="h-12 w-12 rounded-full bg-primary-container border border-outline-variant flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">edit_document</span>
              </div>
              <p className="text-on-surface-variant font-headline font-semibold text-sm">Writer Agent</p>
              <p className="text-outline font-label-sm">Bekliyor</p>
            </div>
          </div>
        </div>
        {/* Recent Reports Table */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="text-on-surface font-headline text-title-md">Son Raporlar</h3>
            <a className="text-secondary font-label-sm hover:underline flex items-center gap-1" href="#">
              Tümünü Gör <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-container/50 border-b border-outline-variant/30">
                  <th className="p-4 text-on-surface-variant font-label-sm uppercase tracking-wider font-semibold">Şirket/Sektör Adı</th>
                  <th className="p-4 text-on-surface-variant font-label-sm uppercase tracking-wider font-semibold">Tarih</th>
                  <th className="p-4 text-on-surface-variant font-label-sm uppercase tracking-wider font-semibold text-center">Güven Skor (%)</th>
                  <th className="p-4 text-on-surface-variant font-label-sm uppercase tracking-wider font-semibold text-right">İndir</th>
                </tr>
              </thead>
              <tbody className="font-body-md divide-y divide-outline-variant/20">
                <tr className="hover:bg-surface-variant/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary-container border border-outline-variant flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">business</span>
                      </div>
                      <span className="text-on-surface font-semibold">Global Enerji Piyasaları</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">12 Eki 2023</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded font-label-sm">%94 Yüksek</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-on-surface-variant hover:text-secondary transition-colors" title="PDF İndir">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </button>
                      <button className="text-on-surface-variant hover:text-secondary transition-colors" title="Sunum İndir">
                        <span className="material-symbols-outlined">slideshow</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-surface-variant/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary-container border border-outline-variant flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">biotech</span>
                      </div>
                      <span className="text-on-surface font-semibold">Biyoteknoloji Startup Analizi</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">08 Eki 2023</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded font-label-sm">%88 İyi</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-on-surface-variant hover:text-secondary transition-colors" title="PDF İndir">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </button>
                      <button className="text-on-surface-variant hover:text-secondary transition-colors" title="Sunum İndir">
                        <span className="material-symbols-outlined">slideshow</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-surface-variant/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-primary-container border border-outline-variant flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                      </div>
                      <span className="text-on-surface font-semibold">E-Ticaret Trendleri Q3</span>
                    </div>
                  </td>
                  <td className="p-4 text-on-surface-variant">01 Eki 2023</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded font-label-sm">%92 Yüksek</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-on-surface-variant hover:text-secondary transition-colors" title="PDF İndir">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </button>
                      <button className="text-on-surface-variant hover:text-secondary transition-colors" title="Sunum İndir">
                        <span className="material-symbols-outlined">slideshow</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
