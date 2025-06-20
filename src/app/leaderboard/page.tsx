
import Header from '@/components/Header';
import LeaderboardPageClient from '@/components/LeaderboardPageClient';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/Footer';

export default async function LeaderboardHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 w-full max-w-7xl flex-grow">
        <LeaderboardPageClient />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
