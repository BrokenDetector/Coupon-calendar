"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthPage = () => {
	const searchParams = useSearchParams();
	const view = searchParams?.get("view");
	const isLogin = view === "login";

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
			</Card>
		</div>
	);
};

export default AuthPage;
