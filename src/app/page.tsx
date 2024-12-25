import { fetchAllBonds } from "@/actions/fetch-all-bonds";
import Header from "@/components/Header";
import LocalPortfolioManager from "@/components/LocalPortfolioManager";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export default async function Home() {
	const session = await getServerSession(authOptions);

	const user = (await db.get(`user:${session?.user.id}`)) as User | undefined;

	const bondsList = await fetchAllBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[800px] ">
			<Header user={user} />
			<LocalPortfolioManager allBonds={bondsList} />
		</main>
	);
}
