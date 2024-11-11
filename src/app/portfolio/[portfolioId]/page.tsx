import { fetchAllBonds } from "@/actions/fetch-all-bonds";
import { fetchBondCoupons, fetchBondData } from "@/actions/fetch-bond";
import Header from "@/components/Header";
import ServerPortfolioManager from "@/components/ServerPortfolioManager";
import { getPortfolio } from "@/helpers/getPortfolio";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {
	params: { portfolioId: string };
}

const page: FC<pageProps> = async ({ params }) => {
	const session = await getServerSession(authOptions);
	const user = (await db.get(`user:${session!.user.id}`)) as User;
	const portfolioId = params.portfolioId;
	const portfolio = await getPortfolio(session!.user.id, portfolioId);

	if (!portfolio) return notFound();

	const bondPromises =
		portfolio.bonds?.map(async (bond) => {
			const bondData = await fetchBondData(bond.SECID);
			const bondCoupons = await fetchBondCoupons(bond.SECID);
			return { ...bondCoupons, quantity: bond.quantity, ...bondData, purchasePrice: bond.purchasePrice || 100 };
		}) || [];

	const bondsList = (await Promise.all(bondPromises)) as BondData[];

	const allBonds = await fetchAllBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[800px]">
			<Header user={user} />

			<ServerPortfolioManager
				initialBonds={bondsList}
				portfolioId={portfolioId}
				allBonds={allBonds}
			/>
		</main>
	);
};

export default page;
