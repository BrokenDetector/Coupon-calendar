"use server";

import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/schemas";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as z from "zod";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
	const validatedFields = RegisterSchema.safeParse(values);

	if (!validatedFields.success) {
		return { error: "Заполните необходимые поля" };
	}

	const { email, password, name } = validatedFields.data;

	const existingId = (await fetchRedis("get", `user:email:${email}`)) as string | null;

	if (existingId) {
		return { error: "Электронная почта уже используется!" };
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

	return { success: "User created" };
};
