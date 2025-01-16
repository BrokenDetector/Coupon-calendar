import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserById } from "@/lib/db-helpers";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
		const userId = session.user.id;

		const user = (await getUserById(userId)) as User;

		const portfolios = user.portfolios;
		const portfolioCount = portfolios.length;

		if (portfolioCount >= 5) {
			return NextResponse.json({ error: "Максимум 5 портфелей." }, { status: 400 });
		}

		const newPortfolioId = portfolioCount > 0 ? portfolioCount + 1 : 1;
		const portfolioName = `Портфель ${newPortfolioId}`;

		const newPortfolio = await db.user.update({
			where: { id: userId },
			data: {
				portfolios: {
					create: {
						name: portfolioName,
						bonds: { create: [] },
					},
				},
			},
		});

		return NextResponse.json(
			{
				message: "Новый портфель успешно создан.",
				newPortfolioId: newPortfolio.id,
				portfolioName,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
