import { fetchAllBonds } from "@/actions/fetch-all-bonds-sec-only";
import { fetchCurrencyRates } from "@/actions/fetch-currency-rates";
import Header from "@/components/Header";
import LocalPortfolioManager from "@/components/LocalPortfolioManager";

export default async function Home() {
	const [bondsList, currencyRatesResponse] = await Promise.all([fetchAllBonds(), fetchCurrencyRates()]);

	if (currencyRatesResponse.error) {
		console.error(currencyRatesResponse.error);
	}

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[800px]">
			<Header />
			<LocalPortfolioManager
				allBonds={bondsList.data || []}
				currencyRates={currencyRatesResponse.data || {}}
			/>
		</main>
	);
}
