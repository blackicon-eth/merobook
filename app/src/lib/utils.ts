import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats the timestamp into a readable format
// Calimero timestamps are in nanoseconds, JavaScript Date expects milliseconds
export const formatTimestamp = (timestamp: number) => {
  // Convert nanoseconds to milliseconds by dividing by 1,000,000
  const timestampMs = timestamp / 1_000_000;
  const date = new Date(timestampMs);
  return date.toLocaleString();
};
