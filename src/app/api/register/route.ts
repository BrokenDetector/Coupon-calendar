import { db } from "@/lib/db";
import { isLimited } from "@/lib/rateLimit";
import { RegisterSchema } from "@/lib/validations/schemas";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const values = await req.json();

	const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") as string);
	const isAllowed = await isLimited(ip);

	if (!isAllowed) {
		return NextResponse.json({ error: "Слишком много запросов, попробуйте позже." }, { status: 429 });
	}

	try {
		const validatedFields = RegisterSchema.safeParse(values);
		if (!validatedFields.success) {
			return NextResponse.json({ error: "Заполните необходимые поля" }, { status: 409 });
		}

		const { email, password, name } = validatedFields.data;

		const existingId = (await db.get(`user:email:${email}`)) as string | null;

		if (existingId) {
			return NextResponse.json({ error: "Электронная почта уже используется!" }, { status: 409 });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const userId = nanoid();

		const userData = {
			id: userId,
			name,
			email,
			password: hashedPassword,
			portfolios: [{ id: "1", name: "Портфель 1", bonds: [] }],
		};

		await db.set(`user:${userId}`, JSON.stringify(userData));

		await db.set(`user:email:${email}`, JSON.stringify(userData.id));

		return NextResponse.json({ message: "пользователь успешно создан." }, { status: 200 });
	} catch (error) {
		console.log(`❗ ERROR: ${error}`);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		} else {
			return NextResponse.json({ error: "Произошла неизвестная ошибка." }, { status: 500 });
		}
	}
}
