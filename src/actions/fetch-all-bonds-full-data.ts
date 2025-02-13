"use server";

import { createBondsWithData } from "@/helpers/createBondObjectWithData";

export const fetchAllBondsFullData = async (): Promise<APIResponse<MOEXBondData[]>> => {
	try {
		const response = await fetch(
			"https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.meta=off&iss.only=securities,marketdata,marketdata_yields&marketprice_board=1&lang=ru"
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch bonds: ${response.status}`);
		}

		const allBondsData = await response.json();
		const bonds = await createBondsWithData(allBondsData);
		return { data: bonds };
	} catch (error) {
		console.error("❗ERROR fetching all bonds with full data: ", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
		};
	}
};
