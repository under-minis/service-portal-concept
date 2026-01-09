/**
 * Formatting utilities for consistent display across the application
 */

/**
 * Format a date to a localized string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString();
}

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

