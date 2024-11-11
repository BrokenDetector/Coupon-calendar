export const fetchAllBonds = async () => {
	try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/all-bonds`, {
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data: Bond[] = await response.json();
		return data;
	} catch (error) {
		console.error("❗ERROR: ", error);
		return [];
	}
};
