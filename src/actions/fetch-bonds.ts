"use server";

import { createBondObjectWithCoupons, createBondsWithData } from "@/helpers/createBondObjectWithData";
import { checkProtection } from "@/lib/protection";

type BondInput = Pick<DBBond, "SECID" | "quantity" | "purchasePrice">;

const createMOEXUrl = (secids: string[], type: "coupons" | "data"): string => {
	const baseUrl = `https://iss.moex.com/iss/engines/stock/markets/bonds`;

	if (type === "coupons") {
		return `https://iss.moex.com/iss/securities/${secids[0]}/bondization.json?iss.json=extended&iss.meta=off&iss.only=coupons&lang=ru&limit=unlimited`;
	}

	return `${baseUrl}/securities.json?iss.meta=off&iss.only=securities,marketdata,marketdata_yields&lang=ru&marketprice_board=1&securities=${secids.join(
		","
	)}`;
};

const chunkBonds = (bonds: BondInput[]): string[][] => {
	const chunkSize = 10;
	const chunks: string[][] = [];
	for (let i = 0; i < bonds.length; i += chunkSize) {
		chunks.push(bonds.slice(i, i + chunkSize).map((bond) => bond.SECID));
	}
	return chunks;
};

const fetchBondCoupons = async (secid: string): Promise<MOEXBondCoupons & { SECID: string }> => {
	try {
		const response = await fetch(createMOEXUrl([secid], "coupons"), { next: { revalidate: 3600 } });
		if (!response.ok) {
			throw new Error(`❗Failed to fetch bond coupons for ${secid}, status: ${response.status}`);
		}
		const data = await response.json();
		return createBondObjectWithCoupons(data);
	} catch (error) {
		console.error(`❗Error fetching coupons for bond ${secid}:`, error);
		throw error;
	}
};

const fetchBondData = async (secids: string[]): Promise<MOEXBondData[]> => {
	try {
		const response = await fetch(createMOEXUrl(secids, "data"), { next: { revalidate: 3600 } });
		if (!response.ok) {
			throw new Error(`❗Failed to fetch bond data for ${secids.join(", ")}, status: ${response.status}`);
		}
		const data = await response.json();
		const bonds = await createBondsWithData(data);
		return bonds;
	} catch (error) {
		console.error(`❗Error fetching data for bonds ${secids.join(", ")}:`, error);
		throw error;
	}
};

export const fetchBonds = async (bonds: BondInput[], fetchCoupons: boolean = false): Promise<Bond[]> => {
	const protection = await checkProtection();
	if (protection.error) {
		throw new Error(protection.error);
	}

	const chunks = chunkBonds(bonds);

	const bondDataPromises = chunks.map((secids) => fetchBondData(secids));

	const bondCouponsPromises = fetchCoupons ? bonds.map((bond) => fetchBondCoupons(bond.SECID)) : [];

	const bondDataResults = await Promise.all(bondDataPromises);
	const bondCouponsResults = fetchCoupons ? await Promise.all(bondCouponsPromises) : [];

	const allBondData = bondDataResults.flat();
	const allBondCoupons = fetchCoupons ? bondCouponsResults : [];

	const allBonds = bonds.map((bond) => {
		const bondDataForCurrent = allBondData.find((data) => data.SECID === bond.SECID);
		const bondCouponsForCurrent = allBondCoupons.find((coupons) => coupons.SECID === bond.SECID);

		return {
			...bondCouponsForCurrent,
			quantity: bond.quantity,
			...bondDataForCurrent,
			purchasePrice: bond.purchasePrice || 100,
		} as Bond;
	});

	return allBonds;
};
