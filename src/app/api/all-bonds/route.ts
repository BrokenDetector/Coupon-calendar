// pages/api/bonds.ts
import { cacheBonds, getCachedBonds } from "@/lib/redis";
import { Bond, BondResponse } from "@/types/bond";

const fetchBondDataFromMoex = async (): Promise<Bond[]> => {
	const response = await fetch(
		"https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.json=extended&iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,ISIN"
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
	}

	const data: BondResponse = await response.json();

	const filteredBonds = data[1].securities
		.map((bond) => ({
			SECID: bond.SECID,
			SHORTNAME: bond.SHORTNAME,
			ISIN: bond.ISIN,
		}))
		.sort((a, b) => a.SHORTNAME.localeCompare(b.SHORTNAME));

	return filteredBonds;
};

export async function GET(req: Request) {
	try {
		// Check Redis cache first
		const cachedBonds = await getCachedBonds();
		if (cachedBonds) {
			// console.log("Returning cached bond data from Redis");
			return new Response(JSON.stringify(cachedBonds));
		}

		// If no cache, fetch fresh data from MOEX
		// console.log("Fetching fresh bond data");
		const bonds = await fetchBondDataFromMoex();

		// Save fresh data to Redis cache
		await cacheBonds(bonds);

		return new Response(JSON.stringify(bonds));
	} catch (error) {
		console.log("ERROR on all-bonds: ", error);
		return new Response("Internal server error", { status: 500 });
	}
}
