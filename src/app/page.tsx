import { fetchAllBonds } from "@/actions/fetch-all-bonds";
import Header from "@/components/Header";
import LocalPortfolioManager from "@/components/LocalPortfolioManager";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db-helpers";
import { getBaseUrl } from "@/lib/utils";
import { getServerSession } from "next-auth";

export default async function Home() {
	const session = await getServerSession(authOptions);

	const user = (await getUserById(session?.user.id || "")) as User | undefined;

	const bondsList = await fetchAllBonds();

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
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[800px] ">
			<Header />
			<LocalPortfolioManager
				allBonds={bondsList}
				currencyRates={currencyRates}
			/>
		</main>
	);
}
