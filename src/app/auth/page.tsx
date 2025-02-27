import AuthPage from "@/components/Auth/AuthCard";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Вход и регистрация — Купоны Облигаций",
	description: "Войдите в свой аккаунт или создайте новый.",
};

const page = async () => {
	return (
		<main className="flex items-center justify-center">
			<AuthPage />
		</main>
	);
};

export default page;
