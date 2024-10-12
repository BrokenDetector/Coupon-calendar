"use server";

import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";

export const addBondToPortfolio = async (portfolioId: string | number, bondsToAdd: Bondsecid[], userId: string) => {
	const userData = (await fetchRedis("get", `user:${userId}`)) as string | null;

	if (!userData) throw new Error("User not found");

	const user = JSON.parse(userData);

	const portfolioIndex = user.portfolios.findIndex((p: Portfolio) => p.id === portfolioId);
	if (portfolioIndex === -1) throw new Error("Portfolio not found");

	const portfolio = user.portfolios[portfolioIndex] as Portfolio;

	bondsToAdd.map((bond) => {
		const existingBondIndex = portfolio.bonds.findIndex((pBond) => pBond.SECID === bond.SECID);

		if (existingBondIndex !== -1) {
			return (portfolio.bonds[existingBondIndex].quantity = bond.quantity);
		} else {
			return portfolio.bonds.push({ SECID: bond.SECID, quantity: bond.quantity });
		}
	});

	user.portfolios[portfolioIndex] = portfolio;
	await db.set(`user:${userId}`, JSON.stringify(user));
};
