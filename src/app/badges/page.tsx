
// src/app/badges/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { predefinedBadges, awardBadges } from '@/lib/badge-logic'; // Using predefinedBadges for display

export default function AllBadgesPage() {
  const allBadgesWithExplanations = predefinedBadges.map(badge => {
    const badgeWithExplanation = awardBadges({
      stats: { totalStars: 0, totalForks: 0, totalFollowers: 0, weeklyCommits: 0, publicRepoCount: 0, publicGistsCount: 0 },
      programmingLanguages: [],
      organizations: []
    }).find(b => b.id === badge.id);

    return {
      ...badge,
      explanation: badgeWithExplanation?.explanation || "Criteria for this badge are defined in the system."
    };
  });


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 w-full max-w-4xl flex-grow">
        <Card className="bg-card border-primary/30 shadow-primary-glow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary flex items-center">
              <Award className="mr-3 h-8 w-8" /> All Available Badges
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Discover the badges you can earn in StarRank Terminal and what they signify.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {allBadgesWithExplanations.length > 0 ? (
              allBadgesWithExplanations.map((badge) => (
                <section key={badge.id} className="p-4 border border-border rounded-lg bg-card/50">
                  <h2 className="text-xl font-semibold text-accent mb-2 flex items-center">
                    <span className="text-2xl mr-2">{badge.emoji}</span> {badge.title}
                  </h2>
                  <p className="text-foreground/90 leading-relaxed">
                    {badge.explanation}
                  </p>
                </section>
              ))
            ) : (
              <p className="text-muted-foreground">No badges are currently defined.</p>
            )}
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
