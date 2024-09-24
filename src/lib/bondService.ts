import { Bond } from "@/types/bond";

// Function to create bond object with coupon dates
const createBondObject = (data: any): Bond => {
	const coupons = data[1]?.coupons;

	if (!coupons.length) {
		throw new Error("❗No coupon data available.");
	}

	const { isin: ISIN, name: SHORTNAME, secid: SECID } = coupons[0];

	const COUPONVALUE: number[] = [];
	const COUPONDATES: string[] = [];

	coupons.forEach((coupon: any) => {
		COUPONVALUE.push(coupon.value);
		COUPONDATES.push(coupon.coupondate);
	});

	return {
		SHORTNAME,
		COUPONVALUE,
		SECID,
		ISIN,
		COUPONDATES,
	};
};

// Fetch individual bond coupons
export const fetchBondCoupons = async (secid: string): Promise<Bond> => {
	try {
		const response = await fetch(
			`https://iss.moex.com/iss/securities/${secid}/bondization.json?iss.json=extended&iss.meta=off&iss.only=coupons&lang=ru&limit=unlimited`
		);

		if (!response.ok) {
			throw new Error(`❗Failed to fetch bond coupons for ${secid}`);
		}

		const data = await response.json();
		return createBondObject(data);
	} catch (error) {
		console.error(`❗Error fetching coupons for bond ${secid}:`, error);
		throw error;
	}
};
