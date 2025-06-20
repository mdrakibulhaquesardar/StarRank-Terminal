
import type { Developer } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Briefcase, Users, GitFork, Star, Github, FileText, BarChart2 } from 'lucide-react'; // Added FileText for Gists

interface ProfileHeaderProps {
  developer: Developer;
}

export default function ProfileHeader({ developer }: ProfileHeaderProps) {
  return (
    <Card className="mb-8 bg-card border-primary/30 shadow-primary-glow-sm">
      <CardHeader className="flex flex-col md:flex-row items-start gap-6 p-6">
        <Image
          src={developer.avatarUrl}
          alt={`${developer.name}'s avatar`}
          width={128}
          height={128}
          className="rounded-full border-4 border-primary shadow-lg"
          data-ai-hint={developer.dataAiHint as string || "developer avatar"}
        />
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
            <CardTitle className="text-3xl font-headline text-primary mb-1 sm:mb-0">
              {developer.name}
            </CardTitle>
            <a
              href={`https://github.com/${developer.githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <Github className="h-4 w-4 mr-1" /> @{developer.githubUsername}
            </a>
          </div>
          {developer.location && (
            <CardDescription className="text-muted-foreground flex items-center mb-1">
              <MapPin className="h-4 w-4 mr-2 shrink-0 text-primary/70" /> {developer.location}
            </CardDescription>
          )}
          {developer.bio && (
            <p className="text-foreground/90 mt-2 text-sm leading-relaxed">{developer.bio}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center border-t border-border/50 pt-4">
          <div className="p-2 rounded-md bg-background/50">
            <h4 className="text-xs text-muted-foreground">REPOSITORIES</h4>
            <p className="text-2xl font-bold text-primary">{developer.stats.publicRepoCount}</p>
          </div>
          <div className="p-2 rounded-md bg-background/50">
            <h4 className="text-xs text-muted-foreground">STARS</h4>
            <p className="text-2xl font-bold text-primary">{developer.stats.totalStars.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-md bg-background/50">
            <h4 className="text-xs text-muted-foreground">FOLLOWERS</h4>
            <p className="text-2xl font-bold text-primary">{developer.stats.totalFollowers.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-md bg-background/50">
            <h4 className="text-xs text-muted-foreground">FORKS</h4>
            <p className="text-2xl font-bold text-primary">{developer.stats.totalForks.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-md bg-background/50">
            <h4 className="text-xs text-muted-foreground">PUBLIC GISTS</h4>
            <p className="text-2xl font-bold text-primary">{developer.stats.publicGistsCount?.toLocaleString() || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
