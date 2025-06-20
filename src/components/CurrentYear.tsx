// src/components/CurrentYear.tsx
"use client";

import { useState, useEffect } from 'react';

export default function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted
    setYear(new Date().getFullYear());
  }, []); // Empty dependency array ensures this runs once on mount

  // During server-side rendering and initial client-side render (before useEffect),
  // 'year' will be null, so nothing or a placeholder is rendered for the year.
  // After hydration and useEffect runs, 'year' will be set and the component will re-render.
  // This ensures the server HTML and initial client HTML match for this dynamic part.
  return <>{year !== null ? year : ""}</>;
}
