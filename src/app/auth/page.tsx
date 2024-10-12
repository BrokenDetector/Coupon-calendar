import AuthPage from "@/components/AuthCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { FC, Suspense } from "react";

const page: FC = () => {
	return (
		<Suspense fallback={<LoadingSpinner />}>
			<main className="min-h-screen flex items-center justify-center">
				<AuthPage />
			</main>
		</Suspense>
	);
};

export default page;
