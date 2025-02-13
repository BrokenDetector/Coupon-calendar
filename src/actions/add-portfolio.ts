"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/lib/db-helpers";
import { checkProtection } from "@/lib/protection";

export async function addPortfolio(): Promise<APIResponse<{ newPortfolioId: string; portfolioName: string }>> {
	try {
		const protection = await checkProtection(true);
		if (protection.error) {
			return { error: protection.error };
		}

		const userId = protection.session?.user.id!;
		const user = (await getUserById(userId)) as DBUser;
		const portfolios = user.portfolios;
		const portfolioCount = portfolios.length;

		if (portfolioCount >= 5) {
			return { error: "Максимум 5 портфелей." };
		}

		const newPortfolioId = portfolioCount > 0 ? portfolioCount + 1 : 1;
		const portfolioName = `Портфель ${newPortfolioId}`;

		const newPortfolio = await db.portfolio.create({
			data: {
				name: portfolioName,
				bonds: { create: [] },
				user: { connect: { id: userId } },
			},
		});

		return {
			data: {
				newPortfolioId: newPortfolio.id,
				portfolioName,
			},
		};
	} catch (error) {
		console.error("❗ERROR: ", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
		};
	}
}
