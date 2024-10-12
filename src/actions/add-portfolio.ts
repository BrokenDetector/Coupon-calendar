"use server";

import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

export const addPortfolio = async () => {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return { error: "Unauthorized" };
	}

	const userId = session.user.id;

	const userKey = `user:${userId}`;

	const userData = (await fetchRedis("get", userKey)) as string;
	const user = JSON.parse(userData) as User;

	const portfolios = user.portfolios;
	const portfolioCount = portfolios.length;
	if (portfolioCount >= 5) {
		return { error: "Максимум 5 портфелей." };
	}

	const newPortfolioId = Number(portfolios[portfolioCount - 1].id) + 1;
	const newPortfolio = {
		id: `${newPortfolioId}`,
		name: `Портфель ${newPortfolioId}`,
		bonds: [],
	};

	user.portfolios.push(newPortfolio);
	await db.set(userKey, JSON.stringify(user));

	return newPortfolioId;
};
