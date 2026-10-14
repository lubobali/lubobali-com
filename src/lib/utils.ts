import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names; later Tailwind classes win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
