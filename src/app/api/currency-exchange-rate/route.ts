import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

interface Valute {
	ID: string;
	NumCode: string;
	CharCode: string; // (RUB, USD, EUR)
	Nominal: string;
	Name: string;
	Value: string;
}

export async function GET(req: Request) {
	try {
		const res = await fetch("https://www.cbr.ru/scripts/XML_daily.asp", {
			next: { revalidate: 3600 },
		});
		if (!res.ok) {
			console.error(`❗Fetch Error: ${await res.text()}`);
			return NextResponse.json(
				{ error: `Ошибка при получении курсов валют: ${res.status} ${res.statusText}` },
				{ status: res.status }
			);
		}

		// Decode with "windows-1251"
		const buffer = await res.arrayBuffer();
		const decoder = new TextDecoder("windows-1251");
		const xmlText = decoder.decode(buffer);

		const jsonData = await parseStringPromise(xmlText, { explicitArray: false });
		const valutes: Valute[] = jsonData.ValCurs.Valute;

		const currencyRates = Object.fromEntries(
			valutes.map((valute) => [
				valute.CharCode,
				{
					rate: parseFloat(valute.Value.replace(",", ".")) / parseFloat(valute.Nominal),
					name: valute.Name,
					charCode: valute.CharCode,
				},
			])
		);

		return NextResponse.json({ currencyRates });
	} catch (error) {
		console.error(`❗ ERROR: ${error}`);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Произошла неизвестная ошибка." },
			{ status: 500 }
		);
	}
}
