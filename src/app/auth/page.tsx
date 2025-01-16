import AuthPage from "@/components/Auth/AuthCard";
import { Metadata } from "next";
import { FC } from "react";

export const metadata: Metadata = {
	title: "Вход и регистрация — Купоны Облигаций",
	description: "Войдите в свой аккаунт или создайте новый.",
};

const page: FC = async () => {
	return (
		<main className="min-h-screen flex items-center justify-center">
			<AuthPage />
		</main>
	);
};

export default page;
