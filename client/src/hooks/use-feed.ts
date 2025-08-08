"use client";

import { useState, useEffect } from "react";

// Define the structure of a single feed item
export interface Feed {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function useFeed() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        // Replace with your actual API endpoint for the feed
        // For demonstration, we'll use a mock promise
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Mock data - replace this with a real API call
        const mockData: Feed[] = [
          { id: '1', title: 'New Course Launched!', content: 'Check out our brand new course on Advanced React.', createdAt: new Date().toISOString() },
          { id: '2', title: 'Summer Sale 50% Off', content: 'Get 50% off on all subscriptions for a limited time.', createdAt: new Date().toISOString() },
          { id: '3', title: 'Maintenance Announcement', content: 'The platform will be down for maintenance on Sunday at 2 AM.', createdAt: new Date().toISOString() },
        ];

        setFeeds(mockData);
        // In a real app, you would do:
        // const response = await fetch('/api/feeds'); // Your API endpoint
        // const data = await response.json();
        // setFeeds(data);

      } catch (e) {
        setError("Failed to fetch feed data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []); // Empty dependency array ensures this runs only once

  return { feeds, loading, error };
}