import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { isAdmin } from '@/lib/auth-utils';
import { RetroGrid } from '@/components/ui/RetroGrid';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is admin (double check even though middleware protects it)
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden text-[#e4e2e3]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-grid" />
          <RetroGrid className="opacity-10" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto py-8 px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
