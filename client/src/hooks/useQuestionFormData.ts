import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

// --- API Functions for fetching dropdown data ---

const fetchSections = async () => {
    const res = await fetch(`${API_BASE_URL}/sections`);
    if (!res.ok) throw new Error("Failed to fetch sections");
    const result = await res.json();
    return result.data;
};

const fetchTopicsBySection = async (sectionId: string) => {
    if (!sectionId) return []; // Don't fetch if no section is selected
    const res = await fetch(`${API_BASE_URL}/topics?sectionId=${sectionId}`);
    if (!res.ok) throw new Error("Failed to fetch topics");
    const result = await res.json();
    return result.data;
};

const fetchSubTopicsByTopic = async (topicId: string) => {
    if (!topicId) return []; // Don't fetch if no topic is selected
    const res = await fetch(`${API_BASE_URL}/sub-topics?topicId=${topicId}`);
    if (!res.ok) throw new Error("Failed to fetch sub-topics");
    const result = await res.json();
    return result.data;
};


// --- React Query Hook for the Question Form ---

export function useQuestionFormData() {
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');

    const sectionsQuery = useQuery({ 
        queryKey: ['sections'], 
        queryFn: fetchSections 
    });

    const topicsQuery = useQuery({
        queryKey: ['topics', selectedSection],
        queryFn: () => fetchTopicsBySection(selectedSection),
        enabled: !!selectedSection, // Only run this query when a section is selected
    });

    const subTopicsQuery = useQuery({
        queryKey: ['subTopics', selectedTopic],
        queryFn: () => fetchSubTopicsByTopic(selectedTopic),
        enabled: !!selectedTopic, // Only run this query when a topic is selected
    });

    return {
        // Data
        sections: sectionsQuery.data,
        topics: topicsQuery.data,
        subTopics: subTopicsQuery.data,
        
        // State Setters
        setSelectedSection,
        setSelectedTopic,

        // Loading States
        isLoadingSections: sectionsQuery.isLoading,
        isLoadingTopics: topicsQuery.isLoading,
        isLoadingSubTopics: subTopicsQuery.isLoading,
    };
}