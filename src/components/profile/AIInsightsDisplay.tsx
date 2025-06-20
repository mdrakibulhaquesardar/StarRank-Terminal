
"use client";

import type { DeveloperStats, DeveloperBadge, AIInsights } from '@/types';
import { generateDeveloperInsights } from '@/ai/flows/generate-developer-insights';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsDisplayProps {
  githubUsername: string;
  stats: DeveloperStats;
  badges: DeveloperBadge[]; // Pass existing badges to potentially enrich their explanations
  onInsightsLoaded?: (insights: AIInsights) => void; // Callback to update parent state if needed
}

export default function AIInsightsDisplay({ githubUsername, stats, badges, onInsightsLoaded }: AIInsightsDisplayProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const badgeTitles = badges.map(b => b.title);
      const input = {
        githubUsername,
        totalStars: stats.totalStars,
        totalForks: stats.totalForks,
        totalFollowers: stats.totalFollowers,
        weeklyCommits: stats.weeklyCommits,
        badges: badgeTitles,
      };
      const result = await generateDeveloperInsights(input);
      setInsights(result);
      if (onInsightsLoaded) {
        onInsightsLoaded(result);
      }
    } catch (e) {
      console.error("Failed to generate AI insights:", e);
      setError("Unable to generate AI insights at this time. The terminal spirits are resting.");
      toast({
        variant: "destructive",
        title: "AI Insight Error",
        description: "Could not retrieve AI-powered insights. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [githubUsername, stats, badges, toast, onInsightsLoaded]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (isLoading) {
    return <LoadingSpinner text="Conjuring AI Insights..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-8 bg-destructive/10 border-destructive/50">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <AlertTitle className="text-destructive font-semibold">Error</AlertTitle>
        <AlertDescription className="text-destructive/90">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!insights) {
    return null; // Should be covered by error or loading states
  }

  return (
    <Card className="mb-8 bg-card border-accent/30 shadow-accent-glow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
          <Terminal className="h-6 w-6 mr-2" /> AI Terminal Insights
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Personalized analysis powered by GenAI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-400" /> Coding Strengths
          </h3>
          <p className="text-foreground/90 leading-relaxed pl-7">{insights.strengths}</p>
        </div>
        
        {badges && badges.length > 0 && insights.badgeExplanations && Object.keys(insights.badgeExplanations).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" /> Badge Intel
            </h3>
            <ul className="space-y-3 pl-7">
              {badges.map(badge => {
                const aiExplanation = insights.badgeExplanations[badge.title];
                if (aiExplanation) {
                  return (
                    <li key={badge.id}>
                      <strong className="text-primary/90">{badge.emoji} {badge.title}:</strong>
                      <p className="text-sm text-foreground/80 italic ml-1">{aiExplanation}</p>
                    </li>
                  );
                }
                return null; 
              })}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-primary mb-2 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" /> Improvement Directives
          </h3>
          <p className="text-foreground/90 leading-relaxed pl-7">{insights.improvementSuggestions}</p>
        </div>
      </CardContent>
    </Card>
  );
}

    