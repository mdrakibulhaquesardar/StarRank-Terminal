
// src/components/Footer.tsx
import Link from 'next/link';
import CurrentYear from '@/components/CurrentYear';
import { Github, Info, Award, Users, Smile } from 'lucide-react';

export default function Footer() {
  const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "https://github.com/firebase/studioprototyper";

  return (
    <footer className="w-full border-t-2 border-primary/30 bg-background text-foreground mt-12">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-headline text-primary mb-3">StarRank Terminal</h3>
            <p className="text-sm text-muted-foreground">
              Discover, rank, and gain insights on GitHub developers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Info className="mr-2 h-4 w-4" /> About StarRank
                </Link>
              </li>
              <li>
                <Link href="/badges" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Award className="mr-2 h-4 w-4" /> All Badges
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contributors" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Users className="mr-2 h-4 w-4" /> Contributors
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  <Github className="mr-2 h-4 w-4" /> Source Code
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Developer</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/meet-the-developer" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <Smile className="mr-2 h-4 w-4" /> Meet The Developer
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-primary/20 text-muted-foreground text-sm">
          StarRank Terminal &copy; <CurrentYear />. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
