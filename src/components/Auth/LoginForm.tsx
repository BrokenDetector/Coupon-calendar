"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/lib/validations/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FC, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

const LoginForm: FC = () => {
	const router = useRouter();
	const [isPending, startPending] = useTransition();

	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
		const validatedFields = LoginSchema.safeParse(values);
		if (!validatedFields.success) {
			return toast.error("Необходимо указать пароль или почту");
		}

		const { email, password } = validatedFields.data;

		startPending(async () => {
			const res = await signIn("credentials", {
				redirect: false,
				email,
				password,
			});

			if (!res?.error) {
				router.push("/");
			} else {
				if (res.error.includes("Google or Yandex account")) {
					toast.error(
						"Этот email связан с аккаунтом Google или Yandex. Пожалуйста, войдите через соответствующий сервис."
					);
				} else {
					toast.error("Неверный email или пароль");
				}
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
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Почта</FormLabel>
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
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={isPending}
				>
					{isPending ? (
						<>
							<Loader className="mr-2 h-4 w-4 animate-spin" />
							Вход...
						</>
					) : (
						"Войти"
					)}
				</Button>
			</form>
		</Form>
	);
};

export default LoginForm;
