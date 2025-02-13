"use server";

import { cache } from "react";
import { parseStringPromise } from "xml2js";

interface Valute {
	ID: string;
	NumCode: string;
	CharCode: string;
	Nominal: string;
	Name: string;
	Value: string;
}

interface CurrencyRates {
	[key: string]: {
		rate: number;
		name: string;
		charCode: string;
	};
}

export const fetchCurrencyRates = cache(async (): Promise<APIResponse<CurrencyRates>> => {
	try {
		const response = await fetch("https://www.cbr.ru/scripts/XML_daily.asp", {
			next: { revalidate: 3600 },
		});

		if (!response.ok) {
			throw new Error(`Ошибка при получении курсов валют: ${response.status} ${response.statusText}`);
		}

		// Decode with "windows-1251"
		const buffer = await response.arrayBuffer();
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

		return { data: currencyRates };
	} catch (error) {
		console.error("❗ERROR: ", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
		};
	}
});
