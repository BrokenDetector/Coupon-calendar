const createMOEXUrl = (secid: string, type: "coupons" | "data"): string => {
	const baseUrl = `https://iss.moex.com/iss/engines/stock/markets/bonds/boards`;
	const board = secid.startsWith("SU") ? "TQOB" : "TQCB";

	if (type === "coupons") {
		return `https://iss.moex.com/iss/securities/${secid}/bondization.json?iss.json=extended&iss.meta=off&iss.only=coupons&lang=ru&limit=unlimited`;
	}
	return `${baseUrl}/${board}/securities/${secid}.json?iss.meta=off&iss.only=securities,marketdata,marketdata_yields&lang=ru`;
};

// for calendar
const createBondObject = (data: any): Bond => {
	const coupons = data[1]?.coupons;

	if (!coupons.length) {
		throw new Error("❗No coupon data available.");
	}

	const { isin: ISIN, name: SHORTNAME, secid: SECID, faceunit: FACEUNIT } = coupons[0];

	const COUPONVALUES: number[] = coupons.map((coupon: any) => coupon.value);
	const COUPONDATES: string[] = coupons.map((coupon: any) => coupon.coupondate);

	return {
		SHORTNAME,
		COUPONVALUES,
		SECID,
		ISIN,
		FACEUNIT,
		COUPONDATES,
	};
};

export const fetchBondCoupons = async (secid: string): Promise<Bond> => {
	try {
		const response = await fetch(createMOEXUrl(secid, "coupons"), { next: { revalidate: 3600 } });
		if (!response.ok) {
			throw new Error(`❗Failed to fetch bond coupons for ${secid}, status: ${response.status}`);
		}
		const data = await response.json();
		return createBondObject(data);
	} catch (error) {
		console.error(`❗Error fetching coupons for bond ${secid}:`, error);
		throw error;
	}
};

// for table
const createBondDataObject = (data: any): BondData => {
	const bondData = data.securities?.data?.[0] ?? [];
	const marketData = data.marketdata?.data?.[0] ?? [];
	const yieldData = data.marketdata_yields?.data?.[0] ?? [];

	const bondValues = {
		SECID: bondData[0],
		NAME: bondData[19],
		SHORTNAME: bondData[2],
		ISIN: bondData[28],
		FACEVALUE: bondData[10],
		NEXTCOUPON: bondData[6],
		COUPONVALUE: bondData[5] || undefined,
		COUPONFREQUENCY: bondData[15],
		MATDATE: bondData[13],
		PREVWAPRICE: marketData[8] || undefined,
		LAST: marketData[11] || undefined,
		EFFECTIVEYIELD: yieldData[6] || undefined,
		ACCRUEDINT: bondData[7],
		FACEUNIT: bondData[25],
		DURATION: marketData[36] || undefined,
		DURATIONWAPRICE: yieldData[12] || undefined,
		COUPONPERCENT: bondData[34],
	} as BondData;

	return bondValues;
};

export const fetchBondData = async (secid: string): Promise<BondData> => {
	try {
		const response = await fetch(createMOEXUrl(secid, "data"), { next: { revalidate: 3600 } });
		if (!response.ok) {
			throw new Error(`❗Failed to fetch bond data for ${secid}, status: ${response.status}`);
		}
		const data = await response.json();
		return createBondDataObject(data);
	} catch (error) {
		console.error(`❗Error fetching data for bond ${secid}:`, error);
		throw error;
	}
};
