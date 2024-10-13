"use client";

import { register } from "@/actions/register";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/lib/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const RegisterForm: FC = () => {
	const [isPending, startPending] = useTransition();
	const router = useRouter();

	const form = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
		const validatedFields = RegisterSchema.safeParse(values);
		if (!validatedFields.success) {
			return toast.error("Заполните необходимые поля");
		}

		const { email, password } = validatedFields.data;

		startPending(async () => {
			const res = await register(values);
			if (!res.error) {
				await signIn("credentials", {
					redirect: false,
					email,
					password,
				});
				router.push("/");
			} else {
				toast.error(res.error);
			}
		});
	};

	return (
		<Form {...form}>
			<form
				className="space-y-6"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Логин</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Введите желаемый логин"
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Электронная почта</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Ваш адрес электронной почты"
										type="email"
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Пароль</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Введите пароль"
										type="password"
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Подтвердите пароль</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Введите пароль еще раз"
										type="password"
										disabled={isPending}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={isPending}
				>
					Зарегистрироваться
				</Button>
			</form>
		</Form>
	);
};

export default RegisterForm;