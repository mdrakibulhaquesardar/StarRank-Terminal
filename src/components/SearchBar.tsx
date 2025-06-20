
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Globe, Code2, Users as UsersIcon } from 'lucide-react'; // Added UsersIcon for organization

interface SearchBarProps {
  onSearch: (term: string, type: 'username' | 'country' | 'language' | 'organization') => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'username' | 'country' | 'language' | 'organization'>('username');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, searchType);
  };

  const getPlaceholderText = () => {
    switch (searchType) {
      case 'username':
        return "Search GitHub Username...";
      case 'country':
        return "Search Country (e.g., USA, India)...";
      case 'language':
        return "Search Language (e.g., Python, JavaScript)...";
      case 'organization':
        return "Search GitHub Organization (e.g., firebase, openai)...";
      default:
        return "Search...";
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-8 p-4 bg-card rounded-lg shadow-lg shadow-primary/10">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-grow w-full sm:w-auto">
          <Input
            type="text"
            placeholder={getPlaceholderText()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-input border-primary/50 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            aria-label="Search term"
          />
        </div>
        <div className="w-full sm:w-auto min-w-[200px]"> {/* Increased min-width for potentially longer text like 'Organization' */}
          <Select value={searchType} onValueChange={(value: 'username' | 'country' | 'language' | 'organization') => setSearchType(value)}>
            <SelectTrigger className="w-full bg-input border-primary/50 text-foreground" aria-label="Search type">
              <SelectValue placeholder="Search by..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-primary/50 text-popover-foreground">
              <SelectItem value="username" className="hover:bg-accent/20 focus:bg-accent/30">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-primary" /> Username
                </div>
              </SelectItem>
              <SelectItem value="country" className="hover:bg-accent/20 focus:bg-accent/30">
                 <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-primary" /> Country
                </div>
              </SelectItem>
              <SelectItem value="language" className="hover:bg-accent/20 focus:bg-accent/30">
                 <div className="flex items-center">
                  <Code2 className="mr-2 h-4 w-4 text-primary" /> Language
                </div>
              </SelectItem>
              <SelectItem value="organization" className="hover:bg-accent/20 focus:bg-accent/30">
                 <div className="flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4 text-primary" /> Organization
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="default" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/80 active:bg-primary/70 shadow-sm shadow-primary/30 hover:shadow-primary-glow-sm transition-all duration-200">
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>
    </form>
  );
}
    
