"use server";

import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";

export const removeBondFromPortfolio = async (portfolioId: string | number, secidToRemove: string, userId: string) => {
	const userData = (await fetchRedis("get", `user:${userId}`)) as string | null;

	if (!userData) throw new Error("User not found");

	const user = JSON.parse(userData);

	const portfolioIndex = user.portfolios.findIndex((p: Portfolio) => p.id === portfolioId);
	if (portfolioIndex === -1) throw new Error("Portfolio not found");

	const portfolio = user.portfolios[portfolioIndex] as Portfolio;
	const updatedBonds = portfolio.bonds.filter((bond) => bond.SECID !== secidToRemove);

	user.portfolios[portfolioIndex].bonds = updatedBonds;

	await db.set(`user:${userId}`, JSON.stringify(user));
};
