"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { customToast } from "../ui/toast/toast-variants";
import LoginForm from "./LoginForm";
import OAuthButtons from "./OAuthButtons";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
	const searchParams = useSearchParams();
	const view = searchParams?.get("view");
	const error = searchParams?.get("error");
	const isLogin = view === "login";

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
						defaultValue={isLogin ? "login" : "register"}
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
