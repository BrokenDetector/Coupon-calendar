"use client";

import { register } from "@/actions/register";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/lib/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { customToast } from "../ui/toast/toast-variants";

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
			return customToast.error("Заполните необходимые поля");
		}

		const { email, password } = validatedFields.data;

		startPending(async () => {
			const response = await register(values);

			if (!response.data) {
				customToast.error(response.error);
				return;
			} else {
				await signIn("credentials", {
					redirect: false,
					email,
					password,
				});
				router.push("/portfolio");
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
					{isPending ? (
						<>
							<Loader className="mr-2 h-4 w-4 animate-spin" />
							Регистрация...
						</>
					) : (
						"Зарегистрироваться"
					)}
				</Button>
			</form>
		</Form>
	);
};

export default RegisterForm;
