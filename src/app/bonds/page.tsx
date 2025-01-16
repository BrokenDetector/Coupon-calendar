import AllBondsCard from "@/components/AllBondsCard";
import Header from "@/components/Header";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db-helpers";
import { getBaseUrl } from "@/lib/utils";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
	title: "Все облигации — Купоны Облигаций",
	description: "Список всех облигаций, торгующихся на Московской бирже.",
};

const page = async () => {
	const session = await getServerSession(authOptions);
	const user = (await getUserById(session?.user?.id!)) as User | undefined;

	const fetchAllBonds = async () => {
		try {
			const response = await fetch(getBaseUrl("/api/all-bonds-with-data"));
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to fetch all bonds, status: ${response.status}. Response: ${errorText}`);
			}
			const data: Bond[] = await response.json();
			return data;
		} catch (error) {
			console.error("❗ERROR: ", error);
			return [];
		}
	};

	const allBonds = await fetchAllBonds();

	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[700px]">
			<Header />
			<AllBondsCard allBonds={allBonds} />
		</main>
	);
};

export default page;
