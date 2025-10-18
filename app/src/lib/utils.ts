import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats the timestamp into a readable format
export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
