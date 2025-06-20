
import type { Developer } from '@/types';
import DeveloperCard from './DeveloperCard';

interface LeaderboardProps {
  developers: Developer[];
}

export default function Leaderboard({ developers }: LeaderboardProps) {
  if (developers.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No developers found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {developers.map((developer) => (
        <DeveloperCard key={developer.id} developer={developer} />
      ))}
    </div>
  );
}

    