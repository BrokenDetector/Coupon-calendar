import CouponCalendar from "@/components/Calendar";
import Portfolio from "@/components/Portfolio";
import { Bond } from "@/types/bond";

export default async function Home() {
	const allBonds = async () => {
		try {
			const response = await fetch("http://localhost:3000/api/all-bonds", {
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data: Bond[] = await response.json();
			return data;
		} catch (error) {
			console.log("ERROR: ", error);
			return [];
		}
	};

	const bondsList = await allBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 p-10 px-5  min-w-[1000px] ">
			<div className="flex flex-row justify-between gap-5">
				<CouponCalendar />
				<Portfolio allBonds={bondsList} />
			</div>
		</main>
	);
}
