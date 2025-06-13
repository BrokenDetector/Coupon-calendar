import { fetchAllBonds } from "@/actions/fetch-all-bonds-sec-only";
import { fetchBonds } from "@/actions/fetch-bonds";
import { fetchCurrencyRates } from "@/actions/fetch-currency-rates";
import ServerPortfolioManager from "@/components/ServerPortfolioManager";
import { authOptions } from "@/lib/auth";
import { getPortfolio } from "@/lib/db-helpers";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
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

	const user = session!.user;

	// `params` should be awaited before using its properties.
	// https://nextjs.org/docs/messages/sync-dynamic-apis
	const { portfolioId } = await params;
	const portfolio = (await getPortfolio(portfolioId)) as DBPortfolio;

	if (!portfolio) {
		if (user.portfolios?.[0]?.id) {
			redirect(`/portfolio/${user.portfolios[0].id}`);
		} else {
			throw new Error("No portfolios found");
		}
	}

	const [portfolioBonds, allBonds, currencyRates] = await Promise.all([
		fetchBonds(portfolio.bonds, true),
		fetchAllBonds(),
		fetchCurrencyRates(),
	]);

	if (portfolioBonds instanceof Error) {
		console.error(`❗Error fetching bonds: ${portfolioBonds.message}`);
	}

	if (allBonds.error) {
		console.error(`❗Error fetching all bonds: ${allBonds.error}`);
	}

	if (currencyRates.error) {
		console.error(`❗Error fetching currency rates: ${currencyRates.error}`);
	}

	return (
		<main>
			<ServerPortfolioManager
				portfolioId={portfolioId}
				allBonds={allBonds.data || []}
				currencyRates={currencyRates.data || {}}
				initialBonds={portfolioBonds}
			/>
		</main>
	);
};

export default page;
