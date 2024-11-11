import { db } from "@/lib/db";

export const getPortfolio = async (userId: string, portfolioId: string) => {
	const user = (await db.get(`user:${userId}`)) as User | null;
	if (!user) return null;
	const portfolios = user.portfolios;
	const portfolio = portfolios.find((p: Portfolio) => p.id === portfolioId) as Portfolio | null;

	return portfolio;
};
