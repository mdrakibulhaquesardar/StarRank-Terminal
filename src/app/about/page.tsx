
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Import the new Footer
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Code2, Users, Star, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 w-full max-w-4xl flex-grow">
        <Card className="bg-card border-primary/30 shadow-primary-glow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">About StarRank Terminal</CardTitle>
            <CardDescription className="text-muted-foreground">
              Discover and rank GitHub developers based on their impact and activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-accent mb-2 flex items-center">
                <Star className="mr-2 h-5 w-5" /> What is StarRank?
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                StarRank Terminal is an application designed to showcase and rank GitHub developers.
                It utilizes the GitHub API to fetch public developer data, calculates an "XP Score"
                based on various metrics like stars, forks, followers, and recent commit activity,
                and then presents this information in an interactive leaderboard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-accent mb-2 flex items-center">
                <Award className="mr-2 h-5 w-5" /> Ranking & XP System
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                The core of StarRank is its XP (Experience Points) system. Developers earn XP based on:
              </p>
              <ul className="list-disc list-inside text-foreground/80 mt-2 space-y-1 pl-4">
                <li>Total stars received on their repositories.</li>
                <li>Total forks of their repositories.</li>
                <li>Number of followers.</li>
                <li>Commit activity in the last week.</li>
                <li>Number of public repositories.</li>
              </ul>
              <p className="text-foreground/90 leading-relaxed mt-2">
                Badges are also awarded for specific achievements, such as "Commit King" for high weekly commit counts
                or "Star Rank" for a significant number of repository stars.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-accent mb-2 flex items-center">
                <Code2 className="mr-2 h-5 w-5" /> Tech Stack
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                This application is built with a modern tech stack:
              </p>
              <ul className="list-disc list-inside text-foreground/80 mt-2 space-y-1 pl-4">
                <li>Next.js (React Framework)</li>
                <li>TypeScript</li>
                <li>Tailwind CSS for styling</li>
                <li>ShadCN UI for components</li>
                <li>MongoDB for database storage</li>
                <li>Genkit for AI-powered insights</li>
                <li>GitHub API for data sourcing</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-accent mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5" /> How to Get Listed
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                Simply search for your GitHub username on the main leaderboard page. If you're not in our database,
                the system will fetch your public GitHub data, calculate your XP and badges, and add you to the rankings.
                Your data will be periodically refreshed.
              </p>
            </section>
             <div className="mt-10 text-center">
                <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Link href="/leaderboard">
                    <ListOrdered className="mr-2 h-4 w-4" /> Back to Leaderboard
                  </Link>
                </Button>
              </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
