import { fetchBonds } from "@/actions/bond-service";
import { fetchCurrencyRates } from "@/actions/fetch-currency-rates";
import LocalPortfolioManager from "@/components/LocalPortfolioManager";

export default async function Home() {
	const [bondsList, currencyRatesResponse] = await Promise.all([
		fetchBonds("all", { detailLevel: "basic", checkAuth: false }),
		fetchCurrencyRates(),
	]);

	return (
		<main>
			<LocalPortfolioManager
				allBonds={bondsList.data || []}
				currencyRates={currencyRatesResponse.data || {}}
				error={bondsList.error || currencyRatesResponse.error}
			/>
		</main>
	);
}
