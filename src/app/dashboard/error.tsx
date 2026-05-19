"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-lg font-medium text-white mb-2">
        Dashboard Yüklenemedi
      </h2>
      <p className="text-[#a1a1aa] text-sm mb-6 max-w-md">
        Veriler alınırken bir sorun oluştu. Sayfayı yenileyebilir veya tekrar deneyebilirsiniz.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
