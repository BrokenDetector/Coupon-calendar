import { isLimited } from "@/helpers/rateLimit";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") as string);
	const isAllowed = await isLimited(ip);

	if (!isAllowed) {
		return NextResponse.json({ error: "Слишком много запросов, попробуйте позже." }, { status: 429 });
	}

	const session = await getServerSession(authOptions);
	if (!session?.user) {
		return NextResponse.json({ error: "Неавторизован." }, { status: 401 });
	}

	try {
		const userId = session.user.id;
		const userKey = `user:${userId}`;

		const user = (await db.get(userKey)) as User;

		const portfolios = user.portfolios;
		const portfolioCount = portfolios.length;

		if (portfolioCount >= 5) {
			return NextResponse.json({ error: "Максимум 5 портфелей." }, { status: 400 });
		}

		const newPortfolioId = portfolioCount > 0 ? Number(portfolios[portfolioCount - 1].id) + 1 : 1;
		const newPortfolio = {
			id: `${newPortfolioId}`,
			name: `Портфель ${newPortfolioId}`,
			bonds: [],
		};

		user.portfolios.push(newPortfolio);
		await db.set(userKey, JSON.stringify(user));

		return NextResponse.json({ message: "Новый портфель успешно создан.", newPortfolioId }, { status: 200 });
	} catch (error) {
		console.log(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
