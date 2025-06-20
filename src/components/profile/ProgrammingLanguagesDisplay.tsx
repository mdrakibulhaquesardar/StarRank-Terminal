
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2 } from 'lucide-react';

interface ProgrammingLanguagesDisplayProps {
  languages: string[];
}

export default function ProgrammingLanguagesDisplay({ languages }: ProgrammingLanguagesDisplayProps) {
  if (!languages || languages.length === 0) {
    return (
      <Card className="mb-8 bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center">
            <Code2 className="h-6 w-6 mr-2" /> Top Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No prominent programming languages identified.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
          <Code2 className="h-6 w-6 mr-2" /> Top Languages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <Badge key={lang} variant="secondary" className="text-sm px-3 py-1 bg-secondary/70 border-primary/30 text-primary">
              {lang}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
