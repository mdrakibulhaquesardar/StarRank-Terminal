
// src/components/profile/RepositoryItem.tsx
import type { ProfileRepository } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitFork, Star, Code, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RepositoryItemProps {
  repo: ProfileRepository;
}

export default function RepositoryItem({ repo }: RepositoryItemProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors shadow-md hover:shadow-primary-glow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary hover:text-accent transition-colors">
            <Link href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center break-all">
              {repo.name}
            </Link>
          </CardTitle>
          <Link href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${repo.name} on GitHub`}>
            <ExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
        {repo.language && (
          <Badge variant="secondary" className="mt-1 self-start text-xs bg-secondary/70 border-primary/30 text-primary">
            <Code className="h-3 w-3 mr-1" /> {repo.language}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-foreground/80 leading-relaxed line-clamp-3 mb-3">
          {repo.description || 'No description provided.'}
        </CardDescription>
        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-auto border-t border-border/50 pt-2">
          <div className="flex items-center" title="Stars">
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            <span>{repo.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center" title="Forks">
            <GitFork className="h-4 w-4 mr-1 text-blue-400" />
            <span>{repo.forks.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
