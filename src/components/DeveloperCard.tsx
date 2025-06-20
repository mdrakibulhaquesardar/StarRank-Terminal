
import type { Developer } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, MapPin, Star } from 'lucide-react';

interface DeveloperCardProps {
  developer: Developer;
}

export default function DeveloperCard({ developer }: DeveloperCardProps) {
  const displayRank = developer.rank && developer.rank > 0 ? developer.rank : "N/A";

  return (
    <Link href={`/developer/${developer.githubUsername}`} passHref legacyBehavior>
      <a className="block group">
        <Card className="bg-card border-primary/20 hover:border-primary/50 transition-all duration-300 ease-in-out shadow-lg hover:shadow-primary-glow-md hover:scale-[1.02] transform cursor-pointer h-full flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4 p-4">
            <Image
              src={developer.avatarUrl}
              alt={`${developer.name}'s avatar`}
              width={64}
              height={64}
              className="rounded-full border-2 border-primary"
              data-ai-hint={developer.dataAiHint as string || "developer avatar"}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-headline text-primary truncate group-hover:text-accent transition-colors">
                {developer.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 shrink-0" /> {developer.country}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground border-secondary">
                  <Award className="h-4 w-4 mr-1 text-accent" /> Rank: {displayRank}
                </Badge>
                <Badge variant="outline" className="border-accent text-accent">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" /> XP: {developer.xpScore.toLocaleString()}
                </Badge>
              </div>
              <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
                {developer.bio || "No bio available."}
              </p>
            </div>
            {developer.programmingLanguages && developer.programmingLanguages.length > 0 && (
              <div className="mt-auto pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Top Languages:</p>
                <div className="flex flex-wrap gap-1">
                  {developer.programmingLanguages.slice(0, 3).map(lang => (
                    <Badge key={lang} variant="outline" className="text-xs border-primary/30 text-primary/80">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
