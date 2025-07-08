"use server";

import { createBondObjectWithCoupons, createBondsWithData } from "@/helpers/createBondObjectWithData";
import { checkProtection } from "@/lib/protection";

type BondRequestInput = Pick<DBBond, "SECID" | "quantity" | "purchasePrice">;
type FetchBondsOptions = {
	detailLevel?: "basic" | "full";
	includeCoupons?: boolean;
	checkAuth?: boolean;
};

const BASE_MOEX_URL = "https://iss.moex.com/iss/engines/stock/markets/bonds";

/**
 * Unified bond data fetching service
 * @param input - Array of bonds or 'all' for complete list
 * @param options - Configuration object
 * @param options.detailLevel - "basic" (essential fields only) or "full" (all market data)
 * @param options.includeCoupons - Whether to include coupon schedule (portfolio bonds only)
 * @param options.checkAuth - Defaults to true (secure). Set false for public data.
 * @returns Bond data based on requested detail level
 * @throws Error when authorization or API requests fail
 *
 * @example
 * // Get portfolio bonds with coupons
 * const portfolio = await fetchBonds(bondList, { includeCoupons: true });
 *
 * // Get bond list with basic info
 * const allBonds = await fetchBonds('all', { detailLevel: 'basic' });
 *
 * // Get bond list with full info and without checking for auth
 * const allBonds = await fetchBonds("all", {detailLevel: 'full', checkAuth: false });
 */
export const fetchBonds = async (
	input: BondRequestInput[] | "all",
	options: FetchBondsOptions = { detailLevel: "full", includeCoupons: false, checkAuth: true }
): Promise<APIResponse<Bond[] | MOEXBondData[]>> => {
	try {
		if (options.checkAuth) {
			const protection = await checkProtection(true);
			if (protection.error) return { error: protection.error };
		}
		const data =
			input === "all" ? await fetchAllBonds(options.detailLevel!) : await fetchPortfolioBonds(input, options);

		return { data };
	} catch (error: any) {
		console.error("[Bond Service] Error in fetchBonds:", error);
		return {
			error: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
		};
	}
};

/**
 * Fetches basic or detailed bond data for all bonds from MOEX API
 */
const fetchAllBonds = async (detailLevel: "basic" | "full"): Promise<MOEXBondData[]> => {
	const response = await fetch(
		`${BASE_MOEX_URL}/securities.json?marketprice_board=1&iss.meta=off${
			detailLevel === "basic" ? "&securities.columns=SECID,SHORTNAME,ISIN,FACEUNIT" : ""
		}`
	);

	if (!response.ok) {
		throw new Error(`[MOEX ERROR] Failed to fetch bonds: ${response.status}`);
	}

	const data = await response.json();
	return createBondsWithData(data);
};

/**
 * Fetches and combines portfolio bond data with market and coupon info
 */
const fetchPortfolioBonds = async (bonds: BondRequestInput[], options: FetchBondsOptions): Promise<Bond[]> => {
	const chunks = [];
	for (let i = 0; i < bonds.length; i += 10) {
		chunks.push(bonds.slice(i, i + 10).map((bond) => bond.SECID));
	}

	const [marketData, coupons] = await Promise.all([
		Promise.all(chunks.map((secids) => fetchMarketData(secids))),
		options.includeCoupons ? Promise.all(bonds.map((bond) => fetchCouponData(bond.SECID))) : [],
	]);

	return bonds.map((bond) => ({
		...(options.includeCoupons && coupons.find((c) => c?.SECID === bond.SECID)),
		quantity: bond.quantity,
		...marketData.flat().find((data) => data.SECID === bond.SECID),
		purchasePrice: bond.purchasePrice || 100,
	})) as Bond[];
};

const fetchMarketData = async (secids: string[]): Promise<MOEXBondData[]> => {
	const response = await fetch(
		`${BASE_MOEX_URL}/securities.json?marketprice_board=1&iss.meta=off&iss.only=securities,marketdata,marketdata_yields&securities=${secids.join(
			","
		)}`,
		{ next: { revalidate: 3600 } }
	);
	if (!response.ok) throw new Error(`[MOEX ERROR] Failed to fetch data for bonds: ${secids.join(",")}`);
	return createBondsWithData(await response.json());
};

const fetchCouponData = async (secid: string): Promise<MOEXBondCoupons & { SECID: string }> => {
	const response = await fetch(
		`https://iss.moex.com/iss/securities/${secid}/bondization.json?iss.json=extended&iss.meta=off`,
		{ next: { revalidate: 3600 } }
	);
	if (!response.ok) throw new Error(`[MOEX ERROR] Failed to fetch coupons for ${secid}`);
	return createBondObjectWithCoupons(await response.json());
};
