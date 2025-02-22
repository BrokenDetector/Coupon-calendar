import { fetchAllBondsFullData } from "@/actions/fetch-all-bonds-full-data";
import AllBondsCard from "@/components/AllBondsCard";
import Header from "@/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Все облигации — Купоны Облигаций",
	description: "Список всех облигаций, торгующихся на Московской бирже.",
};

const page = async () => {
	const allBonds = await fetchAllBondsFullData();
	if (!allBonds.data) {
		console.error("❗ERROR: ", allBonds.error);
		return <div>Произошла ошибка при загрузке данных облигаций.</div>;
	}

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[500px]">
			<Header />
			<AllBondsCard allBonds={allBonds.data} />
		</main>
	);
};

export default page;
