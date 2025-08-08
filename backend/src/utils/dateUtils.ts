/**
 * Utility functions for date conversion and validation
 */

/**
 * Converts various date formats to a JavaScript Date object
 * @param dateValue - The date value to convert (number, string, or Date)
 * @returns Date object or null if conversion fails
 */
export const convertToDate = (dateValue: any): Date | null => {
    if (typeof dateValue === 'number') {
        // If it's a 10-digit number, treat it as seconds (multiply by 1000)
        // If it's a 13-digit number, treat it as milliseconds
        if (dateValue.toString().length === 10) {
            return new Date(dateValue * 1000);
        } else if (dateValue.toString().length === 13) {
            return new Date(dateValue);
        } else {
            return null; // Invalid timestamp length
        }
    } else if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    } else if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    return null;
};

/**
 * Validates if a date value is valid
 * @param dateValue - The date value to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDate = (dateValue: any): boolean => {
    const date = convertToDate(dateValue);
    return date !== null && !isNaN(date.getTime());
};

/**
 * Gets example date formats for error messages
 * @returns Object with example date formats
 */
export const getDateFormatExamples = () => ({
    unix_seconds: Math.floor(Date.now() / 1000),
    unix_milliseconds: Date.now(),
    iso_string: new Date().toISOString(),
    simple_date: new Date().toISOString().split('T')[0]
});
