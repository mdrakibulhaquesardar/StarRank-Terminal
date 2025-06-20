
import Link from 'next/link';
import { Home, Info, Github, ListOrdered } from 'lucide-react';

export default function Header() {
  const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "https://github.com/firebase/studioprototyper";

  return (
    <header className="w-full bg-background py-4 px-6 border-b-2 border-primary shadow-primary-glow-sm sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row justify-between items-center">
        <Link href="/" className="text-3xl md:text-4xl font-headline text-primary mb-2 sm:mb-0 hover:text-accent transition-colors">
          StarRank Terminal
        </Link>
        <nav className="flex space-x-4 sm:space-x-6">
          <Link href="/leaderboard" className="flex items-center text-foreground hover:text-primary transition-colors">
            <ListOrdered className="mr-1 h-5 w-5" />
            Leaderboard
          </Link>
          <Link href="/about" className="flex items-center text-foreground hover:text-primary transition-colors">
            <Info className="mr-1 h-5 w-5" />
            About
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-foreground hover:text-primary transition-colors"
          >
            <Github className="mr-1 h-5 w-5" />
            Source Code
          </a>
        </nav>
      </div>
    </header>
  );
}
