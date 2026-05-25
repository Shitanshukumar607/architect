import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDomain(hostname: string) {
  if (!hostname) return ""
  if (hostname.includes(".")) return hostname
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "architect.shitanshu.me"
  return `${hostname}.${platformDomain}`
}
