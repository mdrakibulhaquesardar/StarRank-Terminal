
import type { DeveloperBadge } from '@/types';
import BadgeItem from './BadgeItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

interface BadgeListProps {
  badges: DeveloperBadge[];
}

export default function BadgeList({ badges }: BadgeListProps) {
  if (!badges || badges.length === 0) {
    return (
      <Card className="mb-8 bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center">
             <Award className="h-6 w-6 mr-2" /> Badges Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This developer hasn't earned any badges yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
          <Award className="h-6 w-6 mr-2" /> Badges Earned
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

    