"use server";

import { db } from "@/lib/db";
import { checkProtection } from "@/lib/protection";

interface AddOrUpdatePortfolioParams {
	id?: string;
	name: string;
	color: string;
}

export async function addOrUpdatePortfolio({
	id,
	name,
	color,
}: AddOrUpdatePortfolioParams): Promise<APIResponse<{ newPortfolioId: string; portfolioName: string }>> {
	try {
		const protection = await checkProtection(true);
		if (protection.error) {
			return { error: protection.error };
		}

		const user = protection.session?.user;
		const portfolios = user!.portfolios;
		const portfolioCount = portfolios.length;

		// We need to check this only if new portfolio is creating
		if (!id && portfolioCount >= 5) {
			return { error: "Максимум 5 портфелей." };
		}

		const portfolioName = name || `Портфель ${portfolioCount > 0 ? portfolioCount + 1 : 1}`;
		const portfolioColor = color || "#94A3B8";

		// If updating, check if portfolio exists and belongs to user
		if (id) {
			const existingPortfolio = await db.portfolio.findFirst({
				where: {
					id,
					userId: user!.id,
				},
			});

			if (!existingPortfolio) {
				return { error: "Портфель не найден" };
			}
		}

		const newPortfolio = id
			? await db.portfolio.update({
					where: { id },
					data: { name, color },
			  })
			: await db.portfolio.create({
					data: {
						name,
						color,
						userId: user!.id,
					},
			  });

		return {
			data: {
				newPortfolioId: newPortfolio.id,
				portfolioName: newPortfolio.name,
			},
		};
	} catch (error) {
		console.error("❗ERROR create or update portfolio:", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
		};
	}
}

export async function deletePortfolio(id: string): Promise<APIResponse<{ success: boolean }>> {
	try {
		const protection = await checkProtection(true);
		if (protection.error) {
			return { error: protection.error };
		}

		const userId = protection.session?.user.id!;

		const portfolio = await db.portfolio.findFirst({
			where: { id, userId },
		});

		if (!portfolio) {
			return { error: "Портфель не найден" };
		}

		await db.portfolio.delete({
			where: { id },
		});

		return { data: { success: true } };
	} catch (error) {
		console.error("❗ERROR delete portfolio:", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
		};
	}
}
