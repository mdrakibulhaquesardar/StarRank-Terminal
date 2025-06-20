
// src/app/contributors/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ListOrdered, Github, AlertTriangle, Medal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getRepoContributors, type GitHubContributor } from '@/services/github';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Specific repo for fetching contributors as per user request
const REPO_OWNER = "mdrakibulhaquesardar";
const REPO_NAME = "StarRank-Terminal";

// Use environment variable for the link to the project's own GitHub repo
const PROJECT_GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export default async function ContributorsPage() {
  let contributors: GitHubContributor[] = [];
  let fetchError: string | null = null;

  try {
    contributors = await getRepoContributors(REPO_OWNER, REPO_NAME);
  } catch (error) {
    console.error("Error fetching contributors:", error);
    fetchError = "Could not fetch contributor data. Please try again later.";
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 w-full max-w-4xl flex-grow">
        <Card className="bg-card border-primary/30 shadow-primary-glow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary flex items-center">
              <Users className="mr-3 h-8 w-8" /> Project Contributors
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Meet the amazing people who have contributed to StarRank Terminal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <p className="text-foreground/90 leading-relaxed">
                StarRank Terminal is an open-source project. We welcome contributions from everyone!
                Whether it's code, documentation, bug reports, or feature suggestions, your help is valuable.
              </p>
            </section>

            {fetchError && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertTitle className="text-destructive font-semibold">Fetch Error</AlertTitle>
                <AlertDescription className="text-destructive/90">{fetchError}</AlertDescription>
              </Alert>
            )}

            {!fetchError && contributors.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-accent mb-4">Our Valued Contributors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contributors.filter(c => c.type === 'User').map((contributor) => (
                    <Card key={contributor.id} className="bg-card/70 border-border hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Link href={contributor.html_url} target="_blank" rel="noopener noreferrer" className="block mb-3">
                          <Image
                            src={contributor.avatar_url}
                            alt={`${contributor.login}'s avatar`}
                            width={80}
                            height={80}
                            className="rounded-full border-2 border-primary group-hover:border-accent transition-colors"
                            data-ai-hint="contributor avatar"
                          />
                        </Link>
                        <h3 className="text-lg font-semibold text-primary hover:text-accent transition-colors">
                          <Link href={contributor.html_url} target="_blank" rel="noopener noreferrer">
                            {contributor.login}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Medal className="h-4 w-4 mr-1 text-yellow-400" /> {contributor.contributions} contributions
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {!fetchError && contributors.length === 0 && (
               <Alert variant="default" className="bg-card/50 border-primary/20">
                 <Users className="h-5 w-5 text-primary"/>
                 <AlertTitle className="font-semibold text-primary">No Contributors Yet</AlertTitle>
                 <AlertDescription className="text-muted-foreground">
                   Be the first to contribute to this project! Your help would be greatly appreciated.
                 </AlertDescription>
              </Alert>
            )}
            
            <section className="mt-8 text-center">
                <Button asChild variant="default" className="bg-primary text-primary-foreground hover:bg-primary/80 mb-4">
                  <a href={`${PROJECT_GITHUB_REPO_URL}/graphs/contributors`} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-5 w-5" /> View Full Contributor Graph on GitHub
                  </a>
                </Button>
                <div>
                  <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Link href="/leaderboard">
                      <ListOrdered className="mr-2 h-4 w-4" /> Back to Leaderboard
                    </Link>
                  </Button>
                </div>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
