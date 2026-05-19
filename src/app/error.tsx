"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111111] border border-white/5 rounded-xl p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">
          Beklenmeyen Bir Hata Oluştu
        </h2>
        <p className="text-[#a1a1aa] text-sm mb-8">
          Sistemsel bir sorun meydana geldi. Lütfen tekrar deneyin veya daha sonra geri dönün.
        </p>
        <button
          onClick={() => reset()}
          className="bg-white text-black hover:bg-gray-200 font-medium px-6 py-2.5 rounded-lg transition-colors w-full"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
