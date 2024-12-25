import AllBondsCard from "@/components/AllBondsCard";
import Header from "@/components/Header";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/utils";
import { getServerSession } from "next-auth";

const page = async () => {
	const session = await getServerSession(authOptions);
	const user = (await db.get(`user:${session?.user.id}`)) as User | null;

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
			<Header user={user || undefined} />
			<AllBondsCard allBonds={allBonds} />
		</main>
	);
};

export default page;
