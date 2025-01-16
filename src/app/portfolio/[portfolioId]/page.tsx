import { fetchAllBonds } from "@/actions/fetch-all-bonds";
import Header from "@/components/Header";
import ServerPortfolioManager from "@/components/ServerPortfolioManager";
import { authOptions } from "@/lib/auth";
import { getPortfolio, getUserById } from "@/lib/db-helpers";
import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FC } from "react";

interface pageProps {
	params: Promise<{ portfolioId: string }>;
}

export const metadata: Metadata = {
	title: "Портфель — Купоны Облигаций",
};

const page: FC<pageProps> = async ({ params }) => {
	const session = await getServerSession(authOptions);
	const user = (await getUserById(session!.user.id)) as User;

	// `params` should be awaited before using its properties.
	// https://nextjs.org/docs/messages/sync-dynamic-apis
	const { portfolioId } = await params;
	const portfolio = await getPortfolio(portfolioId);

	if (!portfolio) {
		if (user.portfolios?.[0]?.id) {
			redirect(`/portfolio/${user.portfolios[0].id}`);
		} else {
			throw new Error("No portfolios found");
		}
	}

	const headersList = await headers();
	const ip = headersList.get("x-real-ip") || headersList.get("x-forwarded-for");

	const res = await fetch(getBaseUrl("/api/fetch-bonds"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Client-ip": ip || "unknown",
		},
		body: JSON.stringify({
			bonds: portfolio.bonds,
			fetchCouponsFlag: true,
		}),
	});

	if (!res.ok) {
		console.error(`❗Error fetching bonds: ${await res.json()}, status: ${res.status}`);
	}

	const bondsList = res.ok ? await res.json() : [];

	const allBonds = await fetchAllBonds();

	const fetchCurrencyRates = async () => {
		const res = await fetch(getBaseUrl("/api/currency-exchange-rate"));
		if (!res.ok) {
			const error = await res.json();
			console.error(error);
		} else {
			const data = await res.json();
			return data.currencyRates;
		}
	};

	const currencyRates = await fetchCurrencyRates();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[800px]">
			<Header />

			<ServerPortfolioManager
				portfolioId={portfolioId}
				allBonds={allBonds}
				currencyRates={currencyRates}
				initialBonds={bondsList}
			/>
		</main>
	);
};

export default page;
