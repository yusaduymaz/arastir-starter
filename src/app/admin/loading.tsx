import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-[#a1a1aa] animate-spin mb-4" />
      <p className="text-[#a1a1aa] text-sm animate-pulse">
        Admin paneli yükleniyor...
      </p>
    </div>
  );
}
