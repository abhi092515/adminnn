import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Define the base URL for your API
const API_BASE_URL = 'http://localhost:5099/api';

/**
 * Generic fetcher function to handle your API's response structure.
 * It expects the actual data array to be in the 'data' property.
 * @param url - The API endpoint to fetch.
 * @returns A promise that resolves to the data array.
 */
const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  const result = await response.json();
  
  // ❗️ FIX: Changed the check from 'result.state === 200' to 'result.success === true'
  // to match your new API response format for topics and sub-topics.
  if (result.success === true && Array.isArray(result.data)) {
    return result.data;
  }

  // Handle the other possible response format for main categories
  if (result.state === 200 && Array.isArray(result.data)) {
    return result.data;
  }

  // Throw an error if the structure is not what's expected
  throw new Error('API response format is incorrect or unsuccessful.');
};

/**
 * A custom hook to manage all state and data fetching for the
 * cascading dropdowns in the QuestionForm.
 */
export function useQuestionFormData() {
  // State to hold the selected ID for each dropdown
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // --- React Query Data Fetching ---

  // 1. Fetch Main Categories
  const { data: mainCategories, isLoading: isLoadingMainCategories } = useQuery({
    queryKey: ['mainCategories'],
    // NOTE: Make sure your API endpoints match these URLs
    queryFn: () => fetchData(`${API_BASE_URL}/main-categories`), 
  });

  // 2. Fetch Categories (runs only when a main category is selected)
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', selectedMainCategory],
    queryFn: () => fetchData(`${API_BASE_URL}/categories?mainCategoryId=${selectedMainCategory}`),
    enabled: !!selectedMainCategory,
  });

  // 3. Fetch Sections (runs only when a category is selected)
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections', selectedCategory],
    queryFn: () => fetchData(`${API_BASE_URL}/sections?categoryId=${selectedCategory}`),
    enabled: !!selectedCategory,
  });

  // 4. Fetch Topics (runs only when a section is selected)
  const { data: topics, isLoading: isLoadingTopics } = useQuery({
    queryKey: ['topics', selectedSection],
    queryFn: () => fetchData(`${API_BASE_URL}/topics?sectionId=${selectedSection}`),
    enabled: !!selectedSection,
  });

  // 5. Fetch Sub-Topics (runs only when a topic is selected)
  const { data: subTopics, isLoading: isLoadingSubTopics } = useQuery({
    queryKey: ['subTopics', selectedTopic],
    queryFn: () => fetchData(`${API_BASE_URL}/sub-topics?topicId=${selectedTopic}`),
    enabled: !!selectedTopic,
  });

  // Expose all the data, loading states, and setters to the component
  return {
    mainCategories,
    isLoadingMainCategories,
    setSelectedMainCategory,
    categories,
    isLoadingCategories,
    setSelectedCategory,
    sections,
    isLoadingSections,
    setSelectedSection,
    topics,
    isLoadingTopics,
    setSelectedTopic,
    subTopics,
    isLoadingSubTopics,
  };
}