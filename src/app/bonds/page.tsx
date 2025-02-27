import { fetchAllBondsFullData } from "@/actions/fetch-all-bonds-full-data";
import AllBondsCard from "@/components/AllBondsCard";
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
		<main className="min-h-screen min-w-[500px] w-full flex flex-col items-center px-4">
			<AllBondsCard allBonds={allBonds.data} />
		</main>
	);
};

export default page;
