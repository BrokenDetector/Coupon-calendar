import { getBaseUrl } from "@/lib/utils";

export const fetchAllBonds = async () => {
	try {
		const response = await fetch(getBaseUrl("/api/all-bonds"));
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to fetch all bonds, status: ${response.status}. Response: ${errorText}`);
		}
		const data: Bond[] = await response.json();
		return data;
	} catch (error) {
		console.error("❗ERROR fetching all bonds: ", error);
		return [];
	}
};
