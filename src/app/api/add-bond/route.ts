import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPortfolio } from "@/lib/db-helpers";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { portfolioId, bondToAdd }: { portfolioId: string; bondToAdd: Bondsecid } = await req.json();

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

		// Update or create bond
		await db.bond.upsert({
			where: {
				SECID_portfolioId: {
					SECID: bondToAdd.SECID,
					portfolioId: portfolioId,
				},
			},
			update: {
				quantity: bondToAdd.quantity,
				purchasePrice: bondToAdd.purchasePrice ? parseFloat(bondToAdd.purchasePrice) : null,
			},
			create: {
				SECID: bondToAdd.SECID,
				quantity: bondToAdd.quantity,
				purchasePrice: bondToAdd.purchasePrice ? parseFloat(bondToAdd.purchasePrice) : null,
				portfolioId: portfolioId,
			},
		});

		return NextResponse.json({ message: "Облигации успешно добавлены." }, { status: 200 });
	} catch (error) {
		console.error(`❗ ERROR adding bond:`, error);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json(
				{ error: "Произошла неизвестная ошибка при добавлении облигации." },
				{ status: 500 }
			);
		}
	}
}
