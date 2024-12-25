import { createBondsWithData } from "@/helpers/createBondObjectWithData";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const responses = await fetch(
			"https://iss.moex.com/iss/engines/stock/markets/bonds/securities.json?iss.meta=off&iss.only=securities,marketdata,marketdata_yields&marketprice_board=1&lang=ru",
			{ cache: "no-cache" }
		);

		const allBondsData = await responses.json();
		const bonds = await createBondsWithData(allBondsData);

		return NextResponse.json(bonds);
	} catch (error) {
		console.error(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
