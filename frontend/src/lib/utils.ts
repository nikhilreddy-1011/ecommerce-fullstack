import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind merge utility — combines clsx + tailwind-merge for clean conditional classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format price to Indian Rupee format
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

// Calculate discount percentage
export function discountPercent(original: number, discounted: number): number {
    return Math.round(((original - discounted) / original) * 100);
}

// Truncate long text
export function truncate(text: string, length: number): string {
    return text.length > length ? `${text.substring(0, length)}...` : text;
}

// Format date to readable string
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}
