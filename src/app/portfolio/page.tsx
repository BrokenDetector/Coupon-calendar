import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db-helpers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const PortfolioRedirect = async () => {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect("/auth");
	}

	const user = await getUserById(session.user.id);
	if (!user?.portfolios?.[0]?.id) {
		throw new Error("No portfolios found");
	}

	redirect(`/portfolio/${user!.portfolios[0].id}`);
};

export default PortfolioRedirect;
