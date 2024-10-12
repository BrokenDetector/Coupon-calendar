import { fetchBondCoupons } from "@/actions/fetch-bond";
import Header from "@/components/Header";
import BondManager from "@/components/New-Portfolio/BondManager";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
	params: { portfolioId: string };
}

const page: FC<pageProps> = async ({ params }) => {
	const session = await getServerSession(authOptions);

	const portfolioId = params.portfolioId;
	const userData = (await fetchRedis("get", `user:${session?.user.id}`)) as string;

	const portfolios = JSON.parse(userData).portfolios;
	const portfolio = portfolios.find((p: Portfolio) => p.id === portfolioId) as Portfolio;

	if (!portfolio) return notFound();

	const bondPromises =
		portfolio.bonds?.map(async (bond) => {
			const bondData = await fetchBondCoupons(bond.SECID);
			return { ...bondData, quantity: bond.quantity };
		}) || [];

	const bondsList = await Promise.all(bondPromises);

	const fetchAllBonds = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/all-bonds`, {
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data: Bond[] = await response.json();
			return data;
		} catch (error) {
			console.error("❗ERROR: ", error);
			return [];
		}
	};

	const allBonds = await fetchAllBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[1000px] ">
			<Header user={JSON.parse(userData)} />

			<BondManager
				allBonds={allBonds}
				portfolioId={portfolioId}
				portfolioName={portfolio.name}
				userId={session!.user.id}
				initialBonds={bondsList}
				isMaxBonds={bondsList.length > 20}
			/>
		</main>
	);
};

export default page;
