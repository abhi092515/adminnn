// src/components/ui/filter-dropdown.tsx

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from 'lucide-react'
import { Label } from "./label";

export interface FilterOption {
  value: string;
  label: string;
  [key: string]: any; // Allow additional properties
}

interface FilterDropdownProps {
  apiEndpoint?: string;
  options?: FilterOption[];
  placeholder?: string;
  label?: string;
  value?: string;
  onValueChange?: (value: string, option?: FilterOption) => void;
  dependsOn?: string;
  dependsOnValue?: string;
  apiParams?: Record<string, any>;
  dataKey?: string;
  valueKey?: string;
  labelKey?: string;
  className?: string;
  disabled?: boolean;
}

export function FilterDropdown({
  apiEndpoint,
  options: externalOptions,
  placeholder = "Select an option",
  label,
  value,
  onValueChange,
  dependsOn,
  dependsOnValue,
  apiParams = {},
  dataKey = 'data',
  valueKey = 'value',
  labelKey = 'label',
  className,
  disabled: externalDisabled
}: FilterDropdownProps) {
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);

  const memoizedApiParams = useMemo(() => apiParams, [JSON.stringify(apiParams)]);

  const fetchOptions = useCallback(async () => {
    if (!apiEndpoint) return;
    setLoading(true);
    try {
      const url = new URL(apiEndpoint, window.location.origin);
      if (dependsOn && dependsOnValue) {
        url.searchParams.append(dependsOn, dependsOnValue);
      }
      Object.entries(memoizedApiParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch options');
      const result = await response.json();
      let optionsData = dataKey ? result[dataKey] : result;
      const transformedOptions: FilterOption[] = Array.isArray(optionsData)
        ? optionsData.map(item => ({
            value: String(item[valueKey] || ''),
            label: String(item[labelKey] || ''),
            original: item
          }))
        : [];
      setOptions(transformedOptions);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, dependsOn, dependsOnValue, memoizedApiParams, dataKey, valueKey, labelKey]);

  useEffect(() => {
    // If external options are provided, use them directly. This is our primary integration path.
    if (externalOptions) {
      setOptions(externalOptions);
      setLoading(false);
      return;
    }

    // Fallback to internal fetching if no externalOptions are given
    if (dependsOn && !dependsOnValue) {
      setOptions([]);
      return;
    }
    fetchOptions();
  }, [externalOptions, dependsOn, dependsOnValue, fetchOptions]);

  const handleValueChange = useCallback((newValue: string) => {
    if (newValue === '_empty_') return; // Prevent action on placeholder
    const selectedOption = options.find(opt => opt.value === newValue);
    onValueChange?.(newValue, selectedOption);
  }, [onValueChange, options]);
  
  const isDisabled = externalDisabled || loading || (!!dependsOn && !dependsOnValue);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <Label htmlFor={label}>{label}</Label>}
      <Select
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={isDisabled}
      >
        <SelectTrigger id={label} className="w-full">
          <SelectValue placeholder={
            loading ? "Loading..." :
            isDisabled && !!dependsOn ? `Select ${dependsOn} first` :
            placeholder
          } />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </SelectTrigger>
        <SelectContent>
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="_empty_" disabled>
              {loading ? "Loading..." : "No options available"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}