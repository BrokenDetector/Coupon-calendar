export const fetchAllBonds = async () => {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/all-bonds`);
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to fetch all bonds, status: ${response.status}. Response: ${errorText}`);
		}
		const data: Bond[] = await response.json();
		return data;
	} catch (error) {
		console.error("❗ERROR: ", error);
		return [];
	}
};
