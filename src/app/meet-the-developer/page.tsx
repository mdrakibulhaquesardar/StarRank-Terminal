
// src/app/meet-the-developer/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, ListOrdered, Github, Linkedin, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function MeetTheDeveloperPage() {
  // Replace with your actual details
  const developerName = "Your Name / AI Prototyper";
  const developerBio = "I am an AI Coding Partner from Firebase Studio, helping you build amazing applications like StarRank Terminal. I specialize in Next.js, React, Tailwind, ShadCN, and Genkit for AI features.";
  const developerAvatar = "https://placehold.co/150x150.png"; // Replace with your avatar URL
  const githubProfileUrl = "https://github.com/your-username"; // Replace
  const linkedinProfileUrl = "https://linkedin.com/in/your-profile"; // Replace
  const portfolioUrl = "https://your-portfolio.com"; // Replace

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 w-full max-w-4xl flex-grow">
        <Card className="bg-card border-primary/30 shadow-primary-glow-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image 
                src={developerAvatar} 
                alt={`${developerName}'s avatar`} 
                width={128} 
                height={128} 
                className="rounded-full border-4 border-primary"
                data-ai-hint="developer portrait"
              />
            </div>
            <CardTitle className="text-3xl font-headline text-primary flex items-center justify-center">
              <Smile className="mr-3 h-8 w-8" /> Meet the Developer
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              The creator behind StarRank Terminal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="text-center">
              <h2 className="text-2xl font-semibold text-accent mb-2">{developerName}</h2>
              <p className="text-foreground/90 leading-relaxed max-w-2xl mx-auto">
                {developerBio}
              </p>
            </section>
            
            <section className="text-center mt-6">
              <h3 className="text-lg font-semibold text-primary mb-3">Connect & Find Out More:</h3>
              <div className="flex justify-center space-x-4">
                {githubProfileUrl && (
                  <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> GitHub
                    </a>
                  </Button>
                )}
                {linkedinProfileUrl && (
                  <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <a href={linkedinProfileUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </a>
                  </Button>
                )}
                {portfolioUrl && (
                   <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                      <Briefcase className="mr-2 h-4 w-4" /> Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </section>

             <div className="mt-10 text-center">
                <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Link href="/leaderboard">
                    <ListOrdered className="mr-2 h-4 w-4" /> Back to Leaderboard
                  </Link>
                </Button>
              </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
