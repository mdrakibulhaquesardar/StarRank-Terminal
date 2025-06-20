
import type { DeveloperBadge } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BadgeItemProps {
  badge: DeveloperBadge;
}

export default function BadgeItem({ badge }: BadgeItemProps) {
  return (
    <Card className="bg-card border-primary/20 hover:border-primary/40 transition-colors shadow-lg hover:shadow-primary-glow-sm flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={badge.title}>{badge.emoji}</span>
          <CardTitle className="text-lg font-semibold text-primary">{badge.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-foreground/80 leading-relaxed">
          {badge.explanation}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

    