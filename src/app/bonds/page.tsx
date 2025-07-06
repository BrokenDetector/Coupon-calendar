import { fetchBonds } from "@/actions/bond-service";
import AllBondsCard from "@/components/AllBondsCard";
import { getErrorMessage } from "@/helpers/getErrorMessage";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Все облигации — Купоны Облигаций",
	description: "Список всех облигаций, торгующихся на Московской бирже.",
};

const page = async () => {
	const allBonds = await fetchBonds("all", { checkAuth: false });
	if (allBonds.error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-red-600">
				<p className="mb-2 text-lg font-semibold">Ошибка загрузки облигаций</p>
				<p className="mb-4 max-w-lg text-center">{getErrorMessage(allBonds.error)}</p>
			</div>
		);
	}

	return (
		<main className="flex flex-col items-center px-4 w-full">
			<AllBondsCard allBonds={allBonds.data!} />
		</main>
	);
};

export default page;
