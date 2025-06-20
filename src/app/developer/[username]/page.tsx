
import { getDeveloperByUsername } from '@/lib/developer-service'; 
import Header from '@/components/Header';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsDisplay from '@/components/profile/StatsDisplay';
import BadgeList from '@/components/profile/BadgeList';
import ProgrammingLanguagesDisplay from '@/components/profile/ProgrammingLanguagesDisplay';
import OrganizationsDisplay from '@/components/profile/OrganizationsDisplay';
import AIInsightsDisplay from '@/components/profile/AIInsightsDisplay';
import RepositoryList from '@/components/profile/RepositoryList'; // Import new component
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Developer } from '@/types';
import Footer from '@/components/Footer';

interface DeveloperProfilePageProps {
  params: {
    username: string;
  };
}

export default async function DeveloperProfilePage({ params }: DeveloperProfilePageProps) {
  const { username } = params;
  let developer: Developer | undefined;

  try {
    developer = await getDeveloperByUsername(username);
  } catch (error) {
    console.error(`Error fetching developer profile for ${username}:`, error);
  }

  if (!developer) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 w-full max-w-4xl text-center flex-grow">
          <Alert variant="destructive" className="mt-10 bg-destructive/10 border-destructive/50">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive font-semibold">Developer Not Found</AlertTitle>
            <AlertDescription className="text-destructive/90">
              The developer profile for "{username}" could not be located or fetched. They might not be in our system or there was an issue retrieving their data.
            </AlertDescription>
          </Alert>
          <Button asChild variant="link" className="mt-6 text-accent hover:text-accent/80">
            <Link href="/leaderboard">
              <ListOrdered className="mr-2 h-4 w-4" /> Go back to Leaderboard
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 w-full max-w-5xl flex-grow">
        <ProfileHeader developer={developer} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StatsDisplay stats={developer.stats} />
            <RepositoryList githubUsername={developer.githubUsername} /> {/* Add RepositoryList */}
            <ProgrammingLanguagesDisplay languages={developer.programmingLanguages} />
            <BadgeList badges={developer.badges} />
            <OrganizationsDisplay organizations={developer.organizations} />
          </div>
          <div className="lg:col-span-1">
            <AIInsightsDisplay 
              githubUsername={developer.githubUsername}
              stats={developer.stats}
              badges={developer.badges}
            />
          </div>
        </div>
         <div className="mt-12 text-center">
            <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
              <Link href="/leaderboard">
                <ListOrdered className="mr-2 h-4 w-4" /> Back to Leaderboard
              </Link>
            </Button>
          </div>
      </main>
       <Footer />
    </div>
  );
}
