import { useCallback } from "react";

export const useLocalStorage = (key: string) => {
	const getLocalData = useCallback(() => {
		try {
			if (typeof window === "undefined") {
				return [];
			}
			const data = localStorage.getItem(key);
			return data ? JSON.parse(data) : [];
		} catch (error) {
			console.error("Error parsing data from localStorage", error);
			return [];
		}
	}, [key]);

	const setLocalData = useCallback(
		(data: any) => {
			try {
				if (typeof window !== "undefined") {
					localStorage.setItem(key, JSON.stringify(data));
				}
			} catch (error) {
				console.error("Error setting data in localStorage", error);
			}
		},
		[key]
	);

	return { getLocalData, setLocalData };
};
