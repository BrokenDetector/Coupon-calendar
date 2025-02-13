"use server";

import { db } from "@/lib/db";
import { getPortfolio } from "@/lib/db-helpers";
import { checkProtection } from "@/lib/protection";
import { revalidatePath } from "next/cache";

export async function addOrUpdateBond(
	portfolioId: string,
	bondToAdd: Bond
): Promise<APIResponse<{ success?: boolean }>> {
	const protection = await checkProtection(true);
	if (protection.error) {
		return protection;
	}

	try {
		const portfolio = await getPortfolio(portfolioId);

		if (!portfolio) {
			return { error: "Портфель не найден." };
		}

		// Update or create bond
		await db.bond.upsert({
			where: {
				SECID_portfolioId: {
					SECID: bondToAdd.SECID,
					portfolioId: portfolioId,
				},
			},
			update: {
				quantity: bondToAdd.quantity,
				purchasePrice: bondToAdd.purchasePrice || null,
			},
			create: {
				SECID: bondToAdd.SECID,
				quantity: bondToAdd.quantity || 1,
				purchasePrice: bondToAdd.purchasePrice || null,
				portfolioId: portfolioId,
			},
		});

		revalidatePath("/portfolio/[id]", "page");
		return { data: { success: true } };
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Ошибка при добавлении облигации",
		};
	}
}

export async function removeBondFromPortfolio(
	portfolioId: string,
	SECID: string
): Promise<APIResponse<{ success?: boolean }>> {
	const protection = await checkProtection();
	if (protection.error) {
		return protection;
	}

	try {
		const portfolio = await getPortfolio(portfolioId);

		if (!portfolio) {
			return { error: "Портфель не найден." };
		}

		await db.bond.delete({
			where: {
				SECID_portfolioId: {
					SECID: SECID,
					portfolioId: portfolioId,
				},
			},
		});

		revalidatePath("/portfolio/[id]", "page");
		return { data: { success: true } };
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : "Ошибка при удалении облигации",
		};
	}
}
