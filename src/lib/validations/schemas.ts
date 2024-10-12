import * as z from "zod";

export const LoginSchema = z.object({
	email: z.string().email({ message: "Электронная почта обязательна" }),
	password: z.string().min(1, { message: "Пароль обязателен" }),
});

export const RegisterSchema = z
	.object({
		email: z.string().email({ message: "Электронная почта обязательна" }),
		name: z.string().min(1, { message: "Логин обязательно" }),
		password: z.string().min(6, { message: "Минимум 6 символов" }),
		confirmPassword: z.string().min(1, { message: "Пароль должен совпадать." }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});
