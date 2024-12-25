import { NextResponse } from "next/server";

const fetchBondDataFromMoex = async (): Promise<Bond[]> => {
	const response = await fetch(
		"https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?marketprice_board=1&iss.json=extended&iss.meta=off&iss.only=securities&securities.columns=SECID,SHORTNAME,ISIN",
		{ next: { revalidate: 3600 } }
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

export async function GET(req: Request) {
	try {
		const bonds = await fetchBondDataFromMoex();

		return NextResponse.json(bonds);
	} catch (error) {
		console.error(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json(
				{ error: `Ошибка при получении всех облигаций: ${error.message}` },
				{ status: 500 }
			);
		} else {
			return NextResponse.json({ error: "Произошла ошибка при получении всех облигаций." }, { status: 500 });
		}
	}
}
