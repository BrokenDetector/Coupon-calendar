import { fetchAllBonds } from "@/actions/fetch-all-bonds";
import Header from "@/components/Header";
import LocalPortfolioManager from "@/components/LocalPortfolioManager";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Home() {
	const session = await getServerSession(authOptions);

	const userData = (await fetchRedis("get", `user:${session?.user.id}`)) as string | null;
	const user = userData ? JSON.parse(userData) : null;

	const bondsList = await fetchAllBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[1000px] ">
			<Header user={user} />
			<LocalPortfolioManager allBonds={bondsList} />
		</main>
	);
}
