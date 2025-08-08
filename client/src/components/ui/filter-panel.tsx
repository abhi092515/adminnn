// src/components/ui/filter-panel.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterDropdown, FilterOption } from "./filter-dropdown";
import { X } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  placeholder?: string;
  apiEndpoint?: string;
  options?: FilterOption[]; // Key for our integration
  dependsOn?: string;
  apiParams?: Record<string, any>;
  dataKey?: string;
  valueKey?: string;
  labelKey?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  onFiltersChange?: (filters: Record<string, string>, filterData: Record<string, FilterOption>) => void;
  onApplyFilters?: (filters: Record<string, string>, filterData: Record<string, FilterOption>) => void;
  onClearFilters?: () => void;
  className?: string;
  showApplyButton?: boolean;
  autoApply?: boolean;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  className,
  showApplyButton = true,
  autoApply = false
}: FilterPanelProps) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [filterData, setFilterData] = useState<Record<string, FilterOption>>({});

  const handleFilterChange = useCallback((key: string, value: string, option?: FilterOption) => {
    const newFilters = { ...filterValues, [key]: value };
    const newData = { ...filterData };

    if (option) {
      newData[key] = option;
    } else {
      delete newData[key];
    }
    
    // Clear dependent filters when a parent filter changes
    const dependentFilters = filters.filter(f => f.dependsOn === key);
    dependentFilters.forEach(f => {
      delete newFilters[f.key];
      delete newData[f.key];
    });

    setFilterValues(newFilters);
    setFilterData(newData);
    
    if (autoApply) {
        onApplyFilters?.(newFilters, newData);
    }
    onFiltersChange?.(newFilters, newData);

  }, [filters, filterValues, filterData, autoApply, onApplyFilters, onFiltersChange]);

  const handleApplyFilters = useCallback(() => {
    onApplyFilters?.(filterValues, filterData);
  }, [filterValues, filterData, onApplyFilters]);

  const handleClearFilters = useCallback(() => {
    setFilterValues({});
    setFilterData({});
    onClearFilters?.();
    onFiltersChange?.({}, {});
  }, [onClearFilters, onFiltersChange]);

  const hasActiveFilters = Object.values(filterValues).some(value => !!value);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="relative pb-2 pt-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          Filters
        </CardTitle>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="absolute top-2 right-2 h-8 px-2 text-xs text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <FilterDropdown
                key={filter.key}
                label={filter.label}
                placeholder={filter.placeholder}
                options={filter.options}
                value={filterValues[filter.key] || ""}
                onValueChange={(value, option) => handleFilterChange(filter.key, value, option)}
                dependsOn={filter.dependsOn}
                dependsOnValue={filter.dependsOn ? filterValues[filter.dependsOn] : undefined}
                valueKey={filter.valueKey}
                labelKey={filter.labelKey}
              />
            ))}
          </div>
          {showApplyButton && !autoApply && (
            <Button
              onClick={handleApplyFilters}
              disabled={!hasActiveFilters}
              className="w-full md:w-auto"
            >
              Apply Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}