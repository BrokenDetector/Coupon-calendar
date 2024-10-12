import CouponCalendar from "@/components/Calendar";
import Header from "@/components/Header";
import Portfolio from "@/components/Portfolio";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Home() {
	const session = await getServerSession(authOptions);

	const userData = (await fetchRedis("get", `user:${session?.user.id}`)) as string | null;
	const user = userData ? JSON.parse(userData) : null;

	const allBonds = async () => {
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

	const bondsList = await allBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[1000px] ">
			<Header user={user} />
			<div className="flex flex-row justify-between gap-5">
				<CouponCalendar />
				<Portfolio allBonds={bondsList} />
			</div>
		</main>
	);
}
