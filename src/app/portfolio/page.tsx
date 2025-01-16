import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db-helpers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const PortfolioRedirect = async () => {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect("/auth");
	}

	// [next-auth][error][CLIENT_FETCH_ERROR]
	// https://next-auth.js.org/errors#client_fetch_error NetworkError when attempting to fetch resource.
	// Object { error: {…}, url: "/api/auth/session", message: "NetworkError when attempting to fetch resource." }

	const user = await getUserById(session.user.id);
	if (!user?.portfolios?.[0]?.id) {
		throw new Error("No portfolios found");
	}

	redirect(`/portfolio/${user!.portfolios[0].id}`);
};

export default PortfolioRedirect;
