// src/hooks/useQuestionFilters.ts

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5099/api';

// --- API Functions for fetching dropdown data ---

const fetchApiData = async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
    const result = await res.json();
    return result.data || [];
};

const fetchTopicsBySection = async (sectionId: string) => {
    if (!sectionId) return [];
    return fetchApiData(`topics?sectionId=${sectionId}`);
};

const fetchSubTopicsByTopic = async (topicId: string) => {
    if (!topicId) return [];
    return fetchApiData(`sub-topics?topicId=${topicId}`);
};

// --- React Query Hook for the Question Filters ---

export function useQuestionFilters() {
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');

    // ✅ FIX: Fetch ALL sections and topics unconditionally for use in the table.
    const allSectionsQuery = useQuery({ 
        queryKey: ['allFilterSections'], 
        queryFn: () => fetchApiData('sections') 
    });

    const allTopicsQuery = useQuery({ 
        queryKey: ['allFilterTopics'], 
        queryFn: () => fetchApiData('topics') 
    });

    // These queries remain dependent on user selection for the filter dropdowns
    const topicsForFilterQuery = useQuery({
        queryKey: ['dependentFilterTopics', selectedSection],
        queryFn: () => fetchTopicsBySection(selectedSection),
        enabled: !!selectedSection,
    });

    const subTopicsForFilterQuery = useQuery({
        queryKey: ['dependentFilterSubTopics', selectedTopic],
        queryFn: () => fetchSubTopicsByTopic(selectedTopic),
        enabled: !!selectedTopic,
    });

    return {
        // Data for display in the results table
        sections: allSectionsQuery.data,
        topics: allTopicsQuery.data,
        
        // Data for the interactive filter dropdowns
        topicsForFilter: topicsForFilterQuery.data,
        subTopics: subTopicsForFilterQuery.data,
        
        // State Setters to trigger dependent queries
        setSelectedSection,
        setSelectedTopic,

        // Loading States
        isLoadingSections: allSectionsQuery.isLoading,
        isLoadingTopics: allTopicsQuery.isLoading,
        isLoadingTopicsForFilter: topicsForFilterQuery.isLoading,
        isLoadingSubTopics: subTopicsForFilterQuery.isLoading,
    };
}