import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const CACHE_DURATION = 1 * 60 * 60; // 1 hour in seconds

const getCachedBonds = async (): Promise<Bond[] | null> => {
	const cachedData = await db.get<Bond[]>("bondsCache");
	if (cachedData) {
		return cachedData;
	}
	return null;
};

const cacheBonds = async (bonds: Bond[]): Promise<void> => {
	await db.set("bondsCache", bonds, { ex: CACHE_DURATION });
};

const fetchBondDataFromMoex = async (): Promise<Bond[]> => {
	const response = await fetch(
		"https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?marketprice_board=1&iss.json=extended&iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,ISIN"
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
			FACEUNIT: bond.FACEUNIT,
		}))
		.sort((a, b) => a.SHORTNAME.localeCompare(b.SHORTNAME));

	return filteredBonds;
};

export async function GET(req: Request) {
	const cachedBonds = await getCachedBonds();

	try {
		if (cachedBonds) {
			return NextResponse.json(cachedBonds, {
				headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
			});
		}

		// If no cache, fetch fresh data from MOEX
		const bonds = await fetchBondDataFromMoex();

		// Save fresh data to Redis cache
		await cacheBonds(bonds);

		return NextResponse.json(bonds, {
			headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
		});
	} catch (error) {
		console.log(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
