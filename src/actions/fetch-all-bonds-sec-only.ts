"use server";

const fetchBondDataFromMoex = async (): Promise<MOEXBondData[]> => {
	const response = await fetch(
		"https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?marketprice_board=1&iss.json=extended&iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,ISIN",
		{
			next: { revalidate: 3600 },
		}
	);

	if (!response.ok) {
		throw new Error(`Ошибка при получении данных облигаций: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	return data[1].securities
		.map((bond: Bond) => ({
			SECID: bond.SECID,
			SHORTNAME: bond.SHORTNAME,
			ISIN: bond.ISIN,
			FACEUNIT: bond.FACEUNIT,
		}))
		.sort((a: Bond, b: Bond) => a.SHORTNAME.localeCompare(b.SHORTNAME));
};

export const fetchAllBonds = async (): Promise<APIResponse<MOEXBondData[]>> => {
	try {
		const bonds = await fetchBondDataFromMoex();
		return { data: bonds };
	} catch (error) {
		console.error("❗ERROR fetching all bonds: ", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
		};
	}
};
