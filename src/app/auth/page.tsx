import AuthPage from "@/components/Auth/AuthCard";
import { FC } from "react";

const page: FC = async () => {
	return (
		<main className="min-h-screen flex items-center justify-center">
			<AuthPage />
		</main>
	);
};

export default page;
