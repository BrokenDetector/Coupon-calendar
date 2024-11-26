import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseUrl(path?: string) {
	const baseUrl =
		process.env.NODE_ENV === "production"
			? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
			: "http://localhost:3000";
	return baseUrl + path;
}
