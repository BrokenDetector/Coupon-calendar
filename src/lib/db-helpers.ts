import { db } from "@/lib/db";

const isValidObjectId = (id: string) => {
	const objectIdPattern = /^[0-9a-fA-F]{24}$/;
	return objectIdPattern.test(id);
};

export const getUserByEmail = async (email: string) => {
	if (!email) return null;
	try {
		const user = await db.user.findUnique({
			where: { email },
			include: {
				portfolios: true,
			},
		});
		return user;
	} catch (error) {
		console.error(error instanceof Error ? error.stack : "Unknown error");
	}
};

export const getUserById = async (id: string) => {
	if (!id || !isValidObjectId(id)) return null;
	try {
		const user = await db.user.findUnique({
			where: { id },
			include: {
				portfolios: true,
			},
		});
		return user;
	} catch (error) {
		console.error(error instanceof Error ? error.stack : "Unknown error");
		return null;
	}
};

export const getPortfolio = async (id: string) => {
	if (!id || !isValidObjectId(id)) return null;
	try {
		const portfolio = await db.portfolio.findFirst({
			where: {
				id,
			},
			orderBy: {
				createdAt: "desc",
			},
			include: {
				bonds: true,
			},
		});
		return portfolio;
	} catch (error) {
		console.error(error instanceof Error ? error.stack : "Unknown error");
		return null;
	}
};
