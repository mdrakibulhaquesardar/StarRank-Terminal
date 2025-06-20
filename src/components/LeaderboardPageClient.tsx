
"use client";

import type { Developer, PaginatedDevelopersResponse } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import Leaderboard from '@/components/Leaderboard';
import PaginationControls from '@/components/PaginationControls';
import { getPaginatedDevelopers, triggerUserSync, getDeveloperByUsername } from '@/lib/developer-service';
import { AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 9;
const DEFAULT_SEARCH_QUERY = "followers:>500 sort:followers-desc type:user";
const USERNAME_SEARCH_MARKER_QUERY = "USERNAME_SEARCH_COMPLETED";
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CachedData<T> {
  timestamp: number;
  data: T;
}

function getFromCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const item = sessionStorage.getItem(key);
  if (!item) return null;

  try {
    const cached = JSON.parse(item) as CachedData<T>;
    if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log(`[Cache] HIT for key: ${key}`);
      return cached.data;
    }
    console.log(`[Cache] EXPIRED for key: ${key}`);
    sessionStorage.removeItem(key); // Remove expired item
    return null;
  } catch (error) {
    console.warn(`[Cache] Error parsing cache for key ${key}:`, error);
    sessionStorage.removeItem(key); // Remove malformed item
    return null;
  }
}

function setToCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  const item: CachedData<T> = {
    timestamp: Date.now(),
    data,
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(item));
    console.log(`[Cache] SET for key: ${key}`);
  } catch (error) {
    console.warn(`[Cache] Error setting cache for key ${key}:`, error);
    // Clear some old cache if storage is full (basic strategy)
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn("[Cache] Quota exceeded. Clearing some old items...");
      // Implement a more sophisticated eviction strategy if needed
      try {
        for (let i = 0; i < sessionStorage.length / 2; i++) { // Clear half
             const oldestKey = sessionStorage.key(i);
             if(oldestKey) sessionStorage.removeItem(oldestKey);
        }
        sessionStorage.setItem(key, JSON.stringify(item)); // Retry
      } catch (retryError) {
        console.error("[Cache] Failed to set cache even after clearing:", retryError);
      }
    }
  }
}


export default function LeaderboardPageClient() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [searchType, setSearchType] = useState<'username' | 'country' | 'language' | 'organization'>('username');
  const [currentQuery, setCurrentQuery] = useState(DEFAULT_SEARCH_QUERY); 

  const { toast } = useToast();

  const fetchDevelopers = useCallback(async (page: number, query: string) => {
    console.log(`[LeaderboardClient] Attempting to fetch developers with query: "${query}", page: ${page}`);
    setIsLoading(true);
    setError(null);

    const cacheKey = `leaderboard-${query}-page-${page}`;
    const cachedResponse = getFromCache<PaginatedDevelopersResponse>(cacheKey);

    if (cachedResponse) {
      setDevelopers(cachedResponse.developers);
      setTotalPages(cachedResponse.totalPages);
      setTotalResults(cachedResponse.totalCount);
      setCurrentPage(cachedResponse.currentPage);
      setIsLoading(false);
      return;
    }
    
    console.log(`[LeaderboardClient] No valid cache. Fetching from API. Query: "${query}", page: ${page}`);
    try {
      const result: PaginatedDevelopersResponse = await getPaginatedDevelopers(page, ITEMS_PER_PAGE, query);
      setDevelopers(result.developers);
      setTotalPages(result.totalPages);
      setTotalResults(result.totalCount);
      setCurrentPage(result.currentPage);
      setToCache(cacheKey, result);

      if (result.developers.length === 0 && query !== DEFAULT_SEARCH_QUERY) {
         console.log(`[LeaderboardClient] No developers found for query: "${query}"`);
      }
    } catch (e) {
      console.error("[LeaderboardClient] Failed to fetch developers:", e);
      setError("Could not fetch developer data. The API might be temporarily unavailable or rate limits exceeded.");
      toast({
        variant: "destructive",
        title: "Data Fetch Error",
        description: "Unable to retrieve developer leaderboard. Please try again later.",
      });
      setDevelopers([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isSyncingUser && currentQuery && currentQuery !== USERNAME_SEARCH_MARKER_QUERY) {
      fetchDevelopers(currentPage, currentQuery);
    }
  }, [currentPage, currentQuery, fetchDevelopers, isSyncingUser]);

  const handleSearch = async (newSearchTerm: string, newSearchType: 'username' | 'country' | 'language' | 'organization') => {
    setSearchTerm(newSearchTerm); 
    setSearchType(newSearchType); 
    setCurrentPage(1); 
    
    if (newSearchTerm.trim() === '') {
        setIsLoading(true);
        setDevelopers([]); 
        setError(null);
        setCurrentQuery(DEFAULT_SEARCH_QUERY); 
        return;
    }

    if (newSearchType === 'username') {
      const usernameToSearch = newSearchTerm.trim();
      setIsSyncingUser(true);
      setIsLoading(true); 
      setDevelopers([]); 
      setError(null);
      toast({ title: "Syncing User 🔄", description: `Attempting to sync ${usernameToSearch}... Please wait.` });
      
      try {
        const syncResult = await triggerUserSync(usernameToSearch);
        if (syncResult.error || !syncResult.user) {
          console.warn(`[LeaderboardClient] Sync issue for ${usernameToSearch}:`, syncResult.details || syncResult.error);
          toast({ variant: "destructive", title: "Sync Problem ⚠️", description: `Could not sync ${usernameToSearch}. Reason: ${syncResult.details || syncResult.error || 'User not found or sync issue.'}` });
        } else {
          toast({ title: "Sync Successful ✅", description: `${usernameToSearch} has been synced.` });
        }

        const cacheKey = `developer-${usernameToSearch}`;
        let developer = getFromCache<Developer>(cacheKey);

        if (!developer) {
          console.log(`[LeaderboardClient] No cache for user ${usernameToSearch}, fetching from service.`);
          developer = await getDeveloperByUsername(usernameToSearch);
          if (developer) {
            setToCache(cacheKey, developer);
          }
        }
        
        if (developer) {
          setDevelopers([developer]);
          setTotalPages(1); 
          setTotalResults(1); 
          setError(null);
        } else {
          setError(`Profile for ${usernameToSearch} could not be loaded.`);
          setDevelopers([]);
          setTotalPages(0);
          setTotalResults(0);
          toast({ variant: "destructive", title: "Profile Load Error", description: `Could not load profile for ${usernameToSearch}.` });
        }
      } catch (searchOrSyncError: any) {
        console.error(`[LeaderboardClient] Error during explicit sync or fetch of ${usernameToSearch}:`, searchOrSyncError);
        toast({ variant: "destructive", title: "Search Error ❌", description: `An error occurred: ${searchOrSyncError.message}` });
        setError(`An error occurred while searching for ${usernameToSearch}.`);
        setDevelopers([]);
        setTotalPages(0);
        setTotalResults(0);
      } finally {
        setIsSyncingUser(false);
        setIsLoading(false);
        setCurrentQuery(USERNAME_SEARCH_MARKER_QUERY); 
      }
    } else { 
      setIsLoading(true);
      setDevelopers([]);
      setError(null);
      let queryToSet = DEFAULT_SEARCH_QUERY;
      if (newSearchType === 'country') {
        queryToSet = `location:"${newSearchTerm.trim()}" type:user sort:followers-desc`;
      } else if (newSearchType === 'language') {
        queryToSet = `language:"${newSearchTerm.trim()}" type:user sort:followers-desc`;
      } else if (newSearchType === 'organization') {
        queryToSet = `org:"${newSearchTerm.trim()}" type:user sort:followers-desc`;
      }
      setCurrentQuery(queryToSet); 
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const getDisplayInfo = () => {
    if (isLoading || isSyncingUser) return "Loading..."; 
    if (error) return ""; 
    
    if (currentQuery === USERNAME_SEARCH_MARKER_QUERY && developers.length === 1 && searchTerm.trim() !== '' && searchType === 'username') {
        return `Displaying profile for ${developers[0].githubUsername}`;
    }
    
    if (totalResults === 0 && developers.length === 0) {
      if (searchTerm.trim() !== '' && currentQuery !== DEFAULT_SEARCH_QUERY) {
        return `No developers found for ${searchType}: "${searchTerm}".`;
      }
      return "No developers found matching your criteria.";
    }
    
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalResults);
    const displayTotal = totalResults > 1000 ? '1000+' : totalResults; 
    
    let filterContext = "";
    if (searchTerm.trim() !== '' && currentQuery !== DEFAULT_SEARCH_QUERY && searchType !== 'username') {
      filterContext = ` for ${searchType}: "${searchTerm}"`;
    }

    return `Showing ${startItem}-${endItem} of ${displayTotal} developers${filterContext}`;
  };

  return (
    <div className="w-full">
      <div className="mb-8 p-6 bg-card rounded-lg shadow-lg shadow-primary/10">
        <div className="flex items-center text-accent mb-3">
          <Zap className="h-6 w-6 mr-2 animate-pulse" />
          <h2 className="text-2xl font-headline">Developer Leaderboard</h2>
        </div>
        <p className="text-muted-foreground">
          Discover top developers. Search by GitHub username, or filter by country, programming language, or GitHub organization. All rankings by XP.
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />
      
      {(isLoading || isSyncingUser) ? (
        <LoadingSpinner text={isSyncingUser ? "Syncing user data..." : "Accessing StarRank Network..."} />
      ) : error ? (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Error</AlertTitle>
          <AlertDescription className="text-destructive/90">{error}</AlertDescription>
        </Alert>
      ) : developers.length > 0 ? (
        <>
          <Leaderboard developers={developers} />
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">{getDisplayInfo()}</p>
            {totalPages > 1 && currentQuery !== USERNAME_SEARCH_MARKER_QUERY && ( 
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </>
      ) : (
         <Alert variant="default" className="bg-card border-primary/20 text-center">
          <AlertCircle className="h-5 w-5 text-primary mx-auto mb-2" />
          <AlertTitle className="font-semibold text-primary">No Developers Found</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {getDisplayInfo()}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
    
