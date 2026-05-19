import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#080808] border border-[#22c55e]/20 rounded-xl p-10 text-center flex flex-col gap-6">
        <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50 tracking-widest uppercase">
          // ÖDEME ONAYLANDI
        </span>
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mx-auto">
          <span
            className="material-symbols-outlined text-3xl text-[#22c55e]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="text-white font-['Montserrat'] font-black text-2xl">
          Aboneliğiniz Aktif!
        </h1>
        <p className="text-[#64748b] font-['Inter'] text-sm leading-relaxed">
          Planınız güncellendi. Token bakiyeniz yenilendi ve tüm özellikler aktif.
          Webhook işleme birkaç saniye sürebilir.
        </p>
        <Link
          href="/dashboard/settings?tab=abonelik"
          className="bg-[#22c55e] text-black font-['Montserrat'] font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#22c55e]/90 transition-colors"
        >
          Aboneliğimi Görüntüle
        </Link>
      </div>
    </div>
  );
}
