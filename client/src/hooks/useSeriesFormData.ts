import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5099/api'; // Adjust if needed

const fetchApiData = async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch from ${endpoint}`);
    const result = await res.json();
    return result.data || [];
};

export function useSeriesFormData() {
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const mainCategoriesQuery = useQuery({ queryKey: ['mainCategories'], queryFn: () => fetchApiData('main-categories') });
    const categoriesQuery = useQuery({
        queryKey: ['categories', selectedMainCategory],
        queryFn: () => fetchApiData(`categories?mainCategoryId=${selectedMainCategory}`),
        enabled: !!selectedMainCategory,
    });
    const subCategoriesQuery = useQuery({
        queryKey: ['subCategories', selectedCategory],
        queryFn: () => fetchApiData(`sub-topics?categoryId=${selectedCategory}`), // Assuming this endpoint exists
        enabled: !!selectedCategory,
    });
    const sectionsQuery = useQuery({ queryKey: ['sections'], queryFn: () => fetchApiData('sections') });

    return {
        mainCategories: mainCategoriesQuery.data,
        categories: categoriesQuery.data,
        subCategories: subCategoriesQuery.data,
        sections: sectionsQuery.data,
        setSelectedMainCategory,
        setSelectedCategory,
        // ... loading states
    };
}