import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

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

    const sectionsQuery = useQuery({ 
        queryKey: ['filterSections'], 
        queryFn: () => fetchApiData('sections') 
    });

    const topicsQuery = useQuery({
        queryKey: ['filterTopics', selectedSection],
        queryFn: () => fetchTopicsBySection(selectedSection),
        enabled: !!selectedSection, // Only run this query when a section is selected
    });

    const subTopicsQuery = useQuery({
        queryKey: ['filterSubTopics', selectedTopic],
        queryFn: () => fetchSubTopicsByTopic(selectedTopic),
        enabled: !!selectedTopic, // Only run this query when a topic is selected
    });

    return {
        // Data
        sections: sectionsQuery.data,
        topics: topicsQuery.data,
        subTopics: subTopicsQuery.data,
        
        // State Setters to trigger dependent queries
        setSelectedSection,
        setSelectedTopic,

        // Loading States
        isLoadingSections: sectionsQuery.isLoading,
        isLoadingTopics: topicsQuery.isLoading,
        isLoadingSubTopics: subTopicsQuery.isLoading,
    };
}