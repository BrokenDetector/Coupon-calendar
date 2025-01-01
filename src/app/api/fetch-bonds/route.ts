import { fetchBonds } from "@/actions/fetch-bond";
import { authOptions } from "@/lib/auth";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { bonds, fetchCouponsFlag }: { bonds: Bond[]; fetchCouponsFlag: boolean } = await req.json();

	const session = await getServerSession(authOptions);

	const ip = req.headers.get("Client-ip") as string;
	const isAllowed = await isLimited(ip, session ? true : false);

	if (!isAllowed) {
		return NextResponse.json({ error: "Слишком много запросов, попробуйте позже." }, { status: 429 });
	}

	try {
		const bondResults = await fetchBonds(bonds, fetchCouponsFlag);
		return NextResponse.json(bondResults, { status: 200 });
	} catch (error) {
		console.error(`❗ ERROR in fetch-bond: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: `Ошибка при получении облигаций: ${error.message}` }, { status: 500 });
		} else {
			return NextResponse.json(
				{ error: "Произошла неизвестная ошибка при получении облигаций." },
				{ status: 500 }
			);
		}
	}
}
