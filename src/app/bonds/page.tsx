import { fetchBonds } from "@/actions/bond-service";
import AllBondsCard from "@/components/AllBondsCard";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Все облигации — Купоны Облигаций",
	description: "Список всех облигаций, торгующихся на Московской бирже.",
};

const page = async () => {
	const allBonds = await fetchBonds("all", { checkAuth: false });
	if (!allBonds.data) {
		console.error("❗ERROR: ", allBonds.error);
		return <div>Произошла ошибка при загрузке данных облигаций.</div>;
	}

	return (
		<main className="flex flex-col items-center px-4 w-full">
			<AllBondsCard allBonds={allBonds.data} />
		</main>
	);
};

export default page;
