"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { customToast } from "../ui/toast/toast-variants";
import LoginForm from "./LoginForm";
import OAuthButtons from "./OAuthButtons";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const error = searchParams?.get("error");
	const [type, setType] = useState<"login" | "register">("login");

	useEffect(() => {
		const view = searchParams?.get("view");
		if (view === "register") {
			setType("register");
		} else {
			setType("login");
		}
	}, [searchParams]);

	const handleTabChange = (value: string) => {
		setType(value as "login" | "register");
		router.push(`/auth?view=${value}`);
	};

	useEffect(() => {
		if (error === "EmailInUse") {
			customToast.error(
				"Этот email уже зарегистрирован с паролем. Пожалуйста, войдите используя email и пароль."
			);
		}
	}, [error]);

	return (
		<div className="container flex flex-col items-center justify-center">
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Аутентификация</CardTitle>
					<CardDescription>Войдите в аккаунт или создайте новый</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						value={type}
						onValueChange={handleTabChange}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">Вход</TabsTrigger>
							<TabsTrigger value="register">Регистрация</TabsTrigger>
						</TabsList>
						<TabsContent value="login">
							<LoginForm />
						</TabsContent>
						<TabsContent value="register">
							<RegisterForm />
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter>
					<OAuthButtons />
				</CardFooter>
			</Card>
		</div>
	);
};

export default AuthPage;
