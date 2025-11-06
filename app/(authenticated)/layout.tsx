import { Sidebar } from '@/components/sidebar';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}

