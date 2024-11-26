import { fetchAllBonds } from "@/actions/fetch-all-bonds";
import Header from "@/components/Header";
import ServerPortfolioManager from "@/components/ServerPortfolioManager";
import { getPortfolio } from "@/helpers/getPortfolio";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
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

	const headersList = await headers();
	const ip = headersList.get("x-real-ip") || headersList.get("x-forwarded-for");

	const res = await fetch(getBaseUrl("/api/fetch-bonds"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Client-ip": ip || "unknow",
		},
		body: JSON.stringify({
			bonds: portfolio.bonds,
			fetchCoupons: true,
		}),
	});

	if (!res.ok) {
		console.error(`❗Error fetching bonds: ${await res.json()}, status: ${res.status}`);
	}

	const bondsList = res.ok ? await res.json() : [];

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
