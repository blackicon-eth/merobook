import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats the timestamp into a readable format
 * @param timestamp - The timestamp to format
 * @returns The formatted timestamp
 */
export const formatTimestamp = (timestamp: number) => {
  // Convert nanoseconds to milliseconds by dividing by 1,000,000
  const timestampMs = timestamp / 1_000_000;
  const date = new Date(timestampMs);
  return date.toLocaleString();
};

/**
 * Format a wallet address to a more readable format
 * @param address - The wallet address
 * @returns The formatted wallet address
 */
export const formatWalletAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @param successMessage - The message to show when the text is copied
 * @param errorMessage - The message to show when the text is not copied
 */
export const copyToClipboard = async (
  text: string | undefined,
  successMessage: string,
  errorMessage: string,
) => {
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (_err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success(successMessage);
    } catch (err) {
      toast.error(errorMessage);
    }
    document.body.removeChild(textArea);
  }
};
