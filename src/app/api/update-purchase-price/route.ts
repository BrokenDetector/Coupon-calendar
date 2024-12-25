import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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
		const userId = session.user.id;
		const user = (await db.get(`user:${userId}`)) as User;

		const portfolioIndex = user.portfolios.findIndex((p: Portfolio) => p.id === portfolioId);
		if (portfolioIndex === -1) {
			return NextResponse.json({ error: "Портфель не найден." }, { status: 404 });
		}

		const portfolio = user.portfolios[portfolioIndex] as Portfolio;

		const bond = portfolio.bonds.find((b: any) => b.SECID === secid);
		if (!bond) {
			throw new Error(`Облигация ${secid} не найдена`);
		}

		bond.purchasePrice = newPrice;
		await db.set(`user:${userId}`, JSON.stringify(user));
		return NextResponse.json({ message: "Облигация успешно обновлена." }, { status: 200 });
	} catch (error) {
		console.error(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
