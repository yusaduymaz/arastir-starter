import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-[#a1a1aa] text-sm tracking-wide animate-pulse">Yükleniyor...</p>
      </div>
    </div>
  );
}
