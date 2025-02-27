import { fetchAllBonds } from "@/actions/fetch-all-bonds-sec-only";
import { fetchCurrencyRates } from "@/actions/fetch-currency-rates";
import LocalPortfolioManager from "@/components/LocalPortfolioManager";

export default async function Home() {
	const [bondsList, currencyRatesResponse] = await Promise.all([fetchAllBonds(), fetchCurrencyRates()]);

	if (currencyRatesResponse.error) {
		console.error(currencyRatesResponse.error);
	}

	return (
		<main>
			<LocalPortfolioManager
				allBonds={bondsList.data || []}
				currencyRates={currencyRatesResponse.data || {}}
			/>
		</main>
	);
}
