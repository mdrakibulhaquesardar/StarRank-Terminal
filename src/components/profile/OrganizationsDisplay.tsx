
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { GitHubOrganization } from '@/types';

interface OrganizationsDisplayProps {
  organizations?: GitHubOrganization[];
}

export default function OrganizationsDisplay({ organizations }: OrganizationsDisplayProps) {
  if (!organizations || organizations.length === 0) {
    return (
      <Card className="mb-8 bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-accent flex items-center">
            <Users className="h-6 w-6 mr-2" /> Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not a member of any publicly listed organizations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-accent flex items-center">
          <Users className="h-6 w-6 mr-2" /> Organizations
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Public organizations this developer is a member of.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {organizations.map((org) => (
            <Link key={org.login} href={`https://github.com/${org.login}`} target="_blank" rel="noopener noreferrer" className="group">
              <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-md hover:shadow-primary-glow-sm transition-shadow duration-200 border border-border group-hover:border-primary/50">
                <Image
                  src={org.avatar_url}
                  alt={`${org.login} organization avatar`}
                  width={64}
                  height={64}
                  className="rounded-full mb-2 border-2 border-transparent group-hover:border-primary transition-colors"
                  data-ai-hint="organization logo"
                />
                <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors truncate">{org.login}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
