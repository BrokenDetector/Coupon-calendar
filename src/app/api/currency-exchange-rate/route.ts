import { authOptions } from "@/lib/auth";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
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
	const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "";
	const isAllowed = await isLimited(ip);

	if (!isAllowed) {
		return NextResponse.json({ error: "Слишком много запросов, попробуйте позже." }, { status: 429 });
	}

	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return NextResponse.json({ error: "Неавторизован." }, { status: 401 });
	}

	try {
		const res = await fetch("https://www.cbr.ru/scripts/XML_daily.asp", { next: { revalidate: 3600 } });
		if (!res.ok) {
			console.error(`❗Fetch Error: ${await res.text()}`);
			return NextResponse.json({ error: "Произошла ошибка при получении данных." }, { status: res.status });
		}

		const xmlText = await res.text();
		const jsonData = await parseStringPromise(xmlText, { explicitArray: false });
		const valutes: Valute[] = jsonData.ValCurs.Valute;

		const currencyRates = Object.fromEntries(
			valutes.map((valute) => [
				valute.CharCode,
				{
					rate: parseFloat(valute.Value.replace(",", ".")) / parseFloat(valute.Nominal),
					name: valute.Name,
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
