import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPortfolio } from "@/lib/db-helpers";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { portfolioId, secid, newPrice }: { portfolioId: string; secid: string; newPrice: string } = await req.json();

	const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") as string);
	const isAllowed = await isLimited(ip, true);

	if (!isAllowed) {
		return NextResponse.json({ error: "Слишком много запросов, попробуйте позже." }, { status: 429 });
	}

	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return NextResponse.json({ error: "Неавторизован." }, { status: 401 });
	}

	try {
		const portfolio = await getPortfolio(portfolioId);

		if (!portfolio) {
			return NextResponse.json({ error: "Портфель не найден." }, { status: 404 });
		}

		await db.bond.update({
			where: {
				SECID_portfolioId: {
					SECID: secid,
					portfolioId: portfolioId,
				},
			},
			data: {
				purchasePrice: parseFloat(newPrice),
			},
		});

		return NextResponse.json({ message: "Облигация успешно обновлена." }, { status: 200 });
	} catch (error) {
		console.error(`❗ ERROR:`, error);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
