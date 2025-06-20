
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Award, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-card to-background/80">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline text-primary mb-6">
              Welcome to StarRank Terminal
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Discover, rank, and gain AI-powered insights on GitHub developers.
              Uncover top talent and explore coding achievements like never before.
            </p>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/80 text-lg px-8 py-6 shadow-accent-glow-sm">
              <Link href="/leaderboard">
                Enter the Terminal <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline text-center text-primary mb-12">
              Why StarRank Terminal?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-primary-glow-sm transition-shadow">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 rounded-full inline-block mb-3">
                    <Zap className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-accent">XP & Ranking System</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Fair and comprehensive XP scoring based on stars, forks, commits, and followers. See who's leading the pack!
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-primary-glow-sm transition-shadow">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 rounded-full inline-block mb-3">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-accent">AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Genkit AI analyzes developer profiles to provide unique strengths, badge explanations, and improvement suggestions.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-primary/20 shadow-lg hover:shadow-primary-glow-sm transition-shadow">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 rounded-full inline-block mb-3">
                    <Award className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-accent">Collectible Badges</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Developers earn cool badges for their achievements, from "Commit King" to "Star Rank".
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Visual/Screenshot Section */}
        <section className="py-16 bg-card">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-headline text-primary mb-8">Experience the Interface</h2>
                <div className="bg-background p-2 rounded-lg shadow-2xl inline-block border-2 border-primary/50">
                    <Image 
                        src="https://i.gifer.com/5bgn.gif"
                        alt="StarRank Terminal Interface Animation"
                        width={1000}
                        height={600}
                        className="rounded-md"
                        data-ai-hint="app interface animation"
                        unoptimized={true} 
                    />
                </div>
                 <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
                    A sleek, terminal-inspired design for exploring developer stats.
                </p>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
