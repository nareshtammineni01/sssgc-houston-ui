import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a date string to a readable format */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

/** Format time from ISO string */
export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/** Truncate text to a given length */
export function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '...';
}

/** Strip HTML tags from a string */
export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}
