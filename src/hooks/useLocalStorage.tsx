"use client";

import { useCallback } from "react";

export const useLocalStorage = (key: string) => {
	const getLocalData = useCallback(() => {
		if (typeof window === "undefined") {
			return [];
		}
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : [];
	}, [key]);

	const setLocalData = useCallback(
		(data: any) => {
			if (typeof window !== "undefined") {
				localStorage.setItem(key, JSON.stringify(data));
			}
		},
		[key]
	);

	return { getLocalData, setLocalData };
};
