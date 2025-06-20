
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or no pages
  }

  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  };

  const handleFirst = () => {
    onPageChange(1);
  }

  const handleLast = () => {
    onPageChange(totalPages);
  }

  // Determine page numbers to display
  // Show current page, 2 before, 2 after, plus first and last if not in range
  const pageNumbers: (number | string)[] = [];
  const MAX_VISIBLE_PAGES = 5; // Includes current, and pages around it. Does not include first/last/ellipses.
  
  if (totalPages <= MAX_VISIBLE_PAGES + 2) { // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1); // Always show first page

    let startPage = Math.max(2, currentPage - Math.floor((MAX_VISIBLE_PAGES -1) / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.floor(MAX_VISIBLE_PAGES / 2));

    if (currentPage < Math.ceil(MAX_VISIBLE_PAGES/2) +1) {
        endPage = Math.min(totalPages -1, MAX_VISIBLE_PAGES);
    }
    if (currentPage > totalPages - Math.ceil(MAX_VISIBLE_PAGES/2)) {
        startPage = Math.max(2, totalPages - MAX_VISIBLE_PAGES +1);
    }


    if (startPage > 2) {
      pageNumbers.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    pageNumbers.push(totalPages); // Always show last page
  }


  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handleFirst}
        disabled={currentPage === 1}
        aria-label="Go to first page"
        className="hidden sm:inline-flex"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            className="hidden sm:inline-flex"
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-2 py-1 text-muted-foreground hidden sm:inline-block">
            {page}
          </span>
        )
      )}
       <Button // Mobile current page display
        variant="outline"
        size="icon"
        className="sm:hidden pointer-events-none"
      >
        {currentPage}
      </Button>


      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleLast}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
        className="hidden sm:inline-flex"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
