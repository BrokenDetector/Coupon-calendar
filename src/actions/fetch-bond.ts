const createMOEXUrl = (secid: string, type: "coupons" | "data"): string => {
	const baseUrl = `https://iss.moex.com/iss/engines/stock/markets/bonds/boards`;
	const board = secid.startsWith("SU") ? "TQOB" : "TQCB";

	if (type === "coupons") {
		return `https://iss.moex.com/iss/securities/${secid}/bondization.json?iss.json=extended&iss.meta=off&iss.only=coupons&lang=ru&limit=unlimited`;
	}
	return `${baseUrl}/${board}/securities/${secid}.json?iss.meta=off&iss.only=securities,marketdata,marketdata_yields&lang=ru`;
};

const mapColumns = (columns: string[]) => {
	return columns.reduce((acc, column, index) => {
		acc[column] = index;
		return acc;
	}, {} as Record<string, number>);
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
	const securitiesColumns = mapColumns(data.securities.columns);
	const marketDataColumns = mapColumns(data.marketdata.columns);
	const yieldDataColumns = mapColumns(data.marketdata_yields.columns);

	const bondData = data.securities.data?.[0] ?? [];
	const marketData = data.marketdata.data?.[0] ?? [];
	const yieldData = data.marketdata_yields.data?.[0] ?? [];

	const bondValues: BondData = {
		SECID: bondData[securitiesColumns["SECID"]],
		NAME: bondData[securitiesColumns["SECNAME"]],
		SHORTNAME: bondData[securitiesColumns["SHORTNAME"]],
		ISIN: bondData[securitiesColumns["ISIN"]],
		FACEVALUE: bondData[securitiesColumns["FACEVALUE"]],
		NEXTCOUPON: bondData[securitiesColumns["NEXTCOUPON"]],
		COUPONVALUE: bondData[securitiesColumns["COUPONVALUE"]] || undefined,
		COUPONFREQUENCY: bondData[securitiesColumns["COUPONPERIOD"]],
		MATDATE: bondData[securitiesColumns["MATDATE"]],
		ACCRUEDINT: bondData[securitiesColumns["ACCRUEDINT"]],
		FACEUNIT: bondData[securitiesColumns["FACEUNIT"]],
		COUPONPERCENT: bondData[securitiesColumns["COUPONPERCENT"]],

		PREVWAPRICE: marketData[marketDataColumns["WAPRICE"]] || undefined,
		LAST: marketData[marketDataColumns["LAST"]] || undefined,
		DURATION: marketData[marketDataColumns["DURATION"]] || undefined,

		EFFECTIVEYIELD: yieldData[yieldDataColumns["EFFECTIVEYIELD"]] || undefined,
		DURATIONWAPRICE: yieldData[yieldDataColumns["DURATIONWAPRICE"]] || undefined,
	};

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
