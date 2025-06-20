// src/lib/badge-logic.ts
import type { DeveloperStats, DeveloperBadge } from '@/types';
import type { GitHubOrg } from '@/services/github'; // GitHubGist import removed as it's not directly used here

interface AwardBadgesArgs {
  stats: DeveloperStats & { publicGistsCount: number }; // publicGistsCount is now non-optional
  programmingLanguages: string[];
  organizations: GitHubOrg[]; 
}

// Updated badge definitions based on user prompt
export const predefinedBadges: Omit<DeveloperBadge, 'explanation'>[] = [
  { id: 'sb1', emoji: '🌟', title: 'Star Rank' },
  { id: 'ck1', emoji: '👑', title: 'Commit King' },
  { id: 'gm1', emoji: '📜', title: 'Gist Master' },
  { id: 'wc1', emoji: '🌍', title: 'World Coder' },
  { id: 'tp1', emoji: '🤝', title: 'Team Player' },
];

const badgeExplanations: Record<string, string> = {
  'Star Rank': 'Awarded for achieving over 500 stars on repositories.',
  'Commit King': 'Recognized for averaging over 20 weekly commits.',
  'Gist Master': 'Awarded for creating more than 5 public gists.',
  'World Coder': 'Proficient in 3 or more programming languages.',
  'Team Player': 'Contributes as a member of one or more GitHub organizations.',
};

export function awardBadges({
  stats,
  programmingLanguages,
  organizations,
}: AwardBadgesArgs): DeveloperBadge[] {
  const awarded: DeveloperBadge[] = [];

  const addBadgeByTitle = (title: string) => {
    const badgeDef = predefinedBadges.find(b => b.title === title);
    if (badgeDef) {
      awarded.push({ ...badgeDef, explanation: badgeExplanations[title] || 'Criteria met for this badge.' });
    }
  };

  if (stats.totalStars > 500) {
    addBadgeByTitle('Star Rank');
  }
  if (stats.weeklyCommits > 20) {
    addBadgeByTitle('Commit King');
  }
  // stats.publicGistsCount is now guaranteed to be a number by the type definition
  if (stats.publicGistsCount > 5) { 
    addBadgeByTitle('Gist Master');
  }
  if (programmingLanguages.length >= 3) {
    addBadgeByTitle('World Coder');
  }
  if (organizations && organizations.length > 0) {
    addBadgeByTitle('Team Player');
  }
  
  return awarded;
}
