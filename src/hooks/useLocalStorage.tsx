import { useCallback } from "react";

export const useLocalStorage = (key: string) => {
	const getLocalData = useCallback(() => {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : [];
	}, [key]);

	const setLocalData = useCallback(
		(data: any) => {
			localStorage.setItem(key, JSON.stringify(data));
		},
		[key]
	);

	return { getLocalData, setLocalData };
};
