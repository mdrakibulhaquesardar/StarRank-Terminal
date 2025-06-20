
import type { DeveloperStats } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart } from 'lucide-react';

interface StatsDisplayProps {
  stats: DeveloperStats;
}

const StatItem: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg shadow-md hover:shadow-primary-glow-sm transition-shadow duration-200">
    {icon && <div className="mb-2 text-primary">{icon}</div>}
    <p className="text-3xl font-bold text-primary">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-sm text-muted-foreground uppercase tracking-wider">{label}</p>
  </div>
);


export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <Card className="mb-8 bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
          <BarChart className="h-6 w-6 mr-2" /> Key Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatItem label="Weekly Commits" value={stats.weeklyCommits} icon={<TrendingUp size={28} />} />
          {/* Other stats are shown in ProfileHeader, this component focuses on activity */}
           <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg shadow-md hover:shadow-primary-glow-sm transition-shadow duration-200">
             <p className="text-sm text-center text-muted-foreground">Detailed repository stats, star history, and follower growth charts could be displayed here for a more in-depth analysis.</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

    