import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { portfolioId, bondToAdd }: { portfolioId: string; bondToAdd: Bond } = await req.json();

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

		const existingBondIndex = portfolio.bonds.findIndex((pBond) => pBond.SECID === bondToAdd.SECID);

		if (existingBondIndex !== -1) {
			portfolio.bonds[existingBondIndex].quantity = bondToAdd.quantity!;
		} else {
			portfolio.bonds.push({ SECID: bondToAdd.SECID, quantity: bondToAdd.quantity! });
		}

		user.portfolios[portfolioIndex] = portfolio;
		await db.set(`user:${userId}`, JSON.stringify(user));

		return NextResponse.json({ message: "Облигации успешно добавлены." }, { status: 200 });
	} catch (error) {
		console.error(`❗ ERROR adding bond: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: `Ошибка при добавлении облигации: ${error.message}` }, { status: 500 });
		} else {
			return NextResponse.json(
				{ error: "Произошла неизвестная ошибка при добавлении облигации." },
				{ status: 500 }
			);
		}
	}
}
