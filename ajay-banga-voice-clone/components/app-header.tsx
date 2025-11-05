import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
}

export function AppHeader({ title, showBack = true }: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        </div>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-stone-600 hover:text-stone-900"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}







