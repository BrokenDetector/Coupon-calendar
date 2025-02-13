"use server";

import { db } from "@/lib/db";
import { checkProtection } from "@/lib/protection";
import { RegisterSchema } from "@/lib/validations/schemas";
import bcrypt from "bcryptjs";

interface RegisterResponse {
	message?: string;
}

export async function register(values: unknown): Promise<APIResponse<RegisterResponse>> {
	try {
		const protection = await checkProtection();
		if (protection.error) {
			return { error: protection.error };
		}

		const validatedFields = RegisterSchema.safeParse(values);
		if (!validatedFields.success) {
			return { error: "Заполните необходимые поля" };
		}

		const { email, password, name } = validatedFields.data;

		const existingUser = await db.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return { error: "Электронная почта уже используется!" };
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await db.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				emailVerified: false,
				portfolios: {
					create: [
						{
							name: "Портфель 1",
							bonds: {
								create: [],
							},
						},
					],
				},
			},
		});

		return { data: { message: "пользователь успешно создан." } };
	} catch (error) {
		console.error("❗ERROR:", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
		};
	}
}
