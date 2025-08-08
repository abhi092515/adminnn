"use strict";
/**
 * Utility functions for date conversion and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateFormatExamples = exports.isValidDate = exports.convertToDate = void 0;
/**
 * Converts various date formats to a JavaScript Date object
 * @param dateValue - The date value to convert (number, string, or Date)
 * @returns Date object or null if conversion fails
 */
const convertToDate = (dateValue) => {
    if (typeof dateValue === 'number') {
        // If it's a 10-digit number, treat it as seconds (multiply by 1000)
        // If it's a 13-digit number, treat it as milliseconds
        if (dateValue.toString().length === 10) {
            return new Date(dateValue * 1000);
        }
        else if (dateValue.toString().length === 13) {
            return new Date(dateValue);
        }
        else {
            return null; // Invalid timestamp length
        }
    }
    else if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
    }
    else if (dateValue instanceof Date) {
        return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    return null;
};
exports.convertToDate = convertToDate;
/**
 * Validates if a date value is valid
 * @param dateValue - The date value to validate
 * @returns boolean indicating if the date is valid
 */
const isValidDate = (dateValue) => {
    const date = (0, exports.convertToDate)(dateValue);
    return date !== null && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
/**
 * Gets example date formats for error messages
 * @returns Object with example date formats
 */
const getDateFormatExamples = () => ({
    unix_seconds: Math.floor(Date.now() / 1000),
    unix_milliseconds: Date.now(),
    iso_string: new Date().toISOString(),
    simple_date: new Date().toISOString().split('T')[0]
});
exports.getDateFormatExamples = getDateFormatExamples;
