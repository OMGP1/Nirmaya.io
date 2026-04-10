/**
 * cn - Class name merge utility
 * 
 * Combines clsx and tailwind-merge for optimal Tailwind class handling.
 * Use this for all component className merging.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Parses an ISO string by stripping its timezone, forcing the browser to interpret
 * it as local time. This resolves the 5:30 hr timezone shift issue in India.
 * E.g., "2026-04-02T09:30:00.000Z" -> 9:30 AM Local
 */
export function getLocalTimeFromUTC(isoString) {
    if (!isoString) return new Date();
    // Extracts "YYYY-MM-DDTHH:mm:ss"
    const match = isoString.match(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/);
    if (!match) return new Date(isoString);
    // Passing string without 'Z' or offset to `new Date` creates local time
    return new Date(match[0]);
}
