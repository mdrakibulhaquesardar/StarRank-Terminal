
// src/components/profile/RepositoryList.tsx
"use client";

import type { ProfileRepository } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { getUserRepositories } from '@/lib/developer-service';
import RepositoryItem from './RepositoryItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, GitBranch } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface RepositoryListProps {
  githubUsername: string;
}

export default function RepositoryList({ githubUsername }: RepositoryListProps) {
  const [repositories, setRepositories] = useState<ProfileRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRepositories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRepos = await getUserRepositories(githubUsername);
      setRepositories(fetchedRepos);
    } catch (e) {
      console.error(`Failed to fetch repositories for ${githubUsername}:`, e);
      setError("Unable to load repositories for this developer.");
      toast({
        variant: "destructive",
        title: "Repository Load Error",
        description: `Could not retrieve repositories for ${githubUsername}.`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [githubUsername, toast]);

  useEffect(() => {
    if (githubUsername) {
      fetchRepositories();
    }
  }, [fetchRepositories, githubUsername]);

  if (isLoading) {
    return (
      <Card className="mb-8 bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center">
            <GitBranch className="h-6 w-6 mr-2" /> Popular Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Fetching repositories..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center">
            <GitBranch className="h-6 w-6 mr-2" /> Popular Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-destructive font-semibold">Error Loading Repositories</AlertTitle>
            <AlertDescription className="text-destructive/90">{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card className="mb-8 bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center">
            <GitBranch className="h-6 w-6 mr-2" /> Popular Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This developer has no public repositories to display, or they could not be fetched.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
          <GitBranch className="h-6 w-6 mr-2" /> Popular Repositories
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          A selection of this developer's public repositories, sorted by stars.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repositories.map((repo) => (
            <RepositoryItem key={repo.fullName} repo={repo} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
