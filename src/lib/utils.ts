import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Returns current Christian Era year (e.g. 2026)
 */
export function getCurrentYearCE(): number {
  return new Date().getFullYear();
}

/**
 * Returns current Buddhist Era year (e.g. 2569)
 */
export function getCurrentYearBE(): number {
  return new Date().getFullYear() + 543;
}

/**
 * Returns full formatted Thai date with Buddhist Era year (e.g. "13 ตุลาคม 2569")
 */
export function getCurrentThaiDateString(includePrefixBE: boolean = false): string {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleDateString('th-TH', { month: 'long' });
  const yearBE = d.getFullYear() + 543;
  return includePrefixBE ? `${day} ${month} พ.ศ. ${yearBE}` : `${day} ${month} ${yearBE}`;
}

/**
 * Returns formatted date with Buddhist Era year (e.g. "13 ต.ค. 2569" or "13 ต.ค. พ.ศ. 2569")
 */
export function formatDateBE(dateString?: string | Date | null, options?: { longMonth?: boolean; prefixBE?: boolean }): string {
  if (!dateString) return '-';
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return String(dateString);
    const day = d.getDate();
    const month = d.toLocaleDateString('th-TH', { month: options?.longMonth ? 'long' : 'short' });
    const yearBE = d.getFullYear() + 543;
    if (options?.prefixBE) {
      return `${day} ${month} พ.ศ. ${yearBE}`;
    }
    return `${day} ${month} ${yearBE}`;
  } catch {
    return String(dateString);
  }
}
