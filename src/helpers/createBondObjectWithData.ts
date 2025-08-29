export const getCurrentYield = (bond: Partial<MOEXBondData>): number => {
	const nominalValue = bond.FACEVALUE || 0;
	const currentPrice = bond.LAST || bond.PREVPRICE || 0;
	const couponFrequency = bond.COUPONFREQUENCY || 365;
	const annualCouponPayment = (bond.COUPONVALUE || 0) * (365 / couponFrequency);

	if (currentPrice > 0) {
		const currentYield = (annualCouponPayment / ((currentPrice / 100) * nominalValue)) * 100;
		return parseFloat(currentYield.toFixed(2));
	}
	return 0;
};

const getCurrentPrice = (bond: Partial<MOEXBondData>): number => {
	return bond.LAST || bond.PREVPRICE || 0;
};

const getTypeName = (secType: string): string => {
	switch (secType) {
		case "3":
			return "ofz_bond";
		case "6":
		case "7":
		case "8":
			return "corporate_bond";
		case "4":
		case "C":
			return "subfederal_bond";
		default:
			return "unknown";
	}
};

const mapColumns = (columns: string[]): Record<string, number> => {
	return columns.reduce((acc, column, index) => {
		acc[column] = index;
		return acc;
	}, {} as Record<string, number>);
};

type RawRow = Array<string | number>;

const getStringAt = (row: RawRow, index: number) => {
	const value = row?.[index];
	if (value === undefined || value === null) return "";
	return String(value);
};

const getNumberAt = (row: RawRow | undefined, index: number) => {
	if (!row) return 0;
	const value = row[index];
	if (value === undefined || value === null || value === "") return 0;
	return Number(value);
};

export const createBondsWithData = (data: {
	securities: { columns: string[]; data: RawRow[] };
	marketdata: { columns: string[]; data: RawRow[] };
	marketdata_yields: { columns: string[]; data: RawRow[] };
}): MOEXBondData[] => {
	if (!data.securities.data || data.securities.data.length === 0 || typeof data.securities.data[0][0] !== "string") {
		throw new Error("[MOEX ERROR] No securities data found for the given SECID(s).");
	}

	const securitiesColumns = mapColumns(data.securities.columns);
	const marketDataColumns = mapColumns(data.marketdata.columns);
	const yieldDataColumns = mapColumns(data.marketdata_yields.columns);

	const yieldDataMap = new Map<string, RawRow>();
	data.marketdata_yields.data.forEach((yieldData) => {
		const secid = getStringAt(yieldData, yieldDataColumns["SECID"]);
		if (secid) {
			yieldDataMap.set(secid, yieldData);
		}
	});

	return data.securities.data.map((bondData) => {
		const secid = getStringAt(bondData, securitiesColumns["SECID"]);
		const marketData = data.marketdata.data.find((md) => getStringAt(md, marketDataColumns["SECID"]) === secid);
		const yieldData = yieldDataMap.get(secid);

		const bond = {
			SECID: secid,
			NAME: getStringAt(bondData, securitiesColumns["SECNAME"]),
			SHORTNAME: getStringAt(bondData, securitiesColumns["SHORTNAME"]),
			ISIN: getStringAt(bondData, securitiesColumns["ISIN"]),
			FACEVALUE: getNumberAt(bondData, securitiesColumns["FACEVALUE"]),
			NEXTCOUPON: getStringAt(bondData, securitiesColumns["NEXTCOUPON"]),
			COUPONVALUE: getNumberAt(bondData, securitiesColumns["COUPONVALUE"]),
			COUPONFREQUENCY: getNumberAt(bondData, securitiesColumns["COUPONPERIOD"]),
			MATDATE: getStringAt(bondData, securitiesColumns["MATDATE"]),
			ACCRUEDINT: getNumberAt(bondData, securitiesColumns["ACCRUEDINT"]),
			FACEUNIT: getStringAt(bondData, securitiesColumns["FACEUNIT"]),
			COUPONPERCENT: getNumberAt(bondData, securitiesColumns["COUPONPERCENT"]),
			PREVPRICE: getNumberAt(bondData, securitiesColumns["PREVPRICE"]),
			LAST: getNumberAt(marketData, marketDataColumns["LAST"]),
			DURATION: getNumberAt(marketData, marketDataColumns["DURATION"]),
			EFFECTIVEYIELD: getNumberAt(yieldData, yieldDataColumns["EFFECTIVEYIELD"]),
			DURATIONWAPRICE: getNumberAt(yieldData, yieldDataColumns["DURATIONWAPRICE"]),
			TYPE: getTypeName(getStringAt(bondData, securitiesColumns["SECTYPE"])),
		};

		return {
			...bond,
			CURRENTPRICE: getCurrentPrice(bond),
			CURRENTYIELD: getCurrentYield(bond),
		};
	});
};

export const createBondObjectWithCoupons = (
	data: [
		charsetinfo: { name: string },
		{
			coupons: { secid: string; value: number; coupondate: string }[];
			amortizations: { secid: string; value: number; valueprc: string; amortdate: string }[];
		}
	]
): MOEXBondCoupons & { SECID: string } => {
	const coupons = data[1]?.coupons;
	const amortizations = data[1]?.amortizations || [];

	if (!coupons.length) {
		throw new Error("❗No coupon data available.");
	}

	const { secid: SECID } = coupons[0];

	const COUPONVALUES = coupons.map((coupon) => coupon.value);
	const COUPONDATES = coupons.map((coupon) => coupon.coupondate);

	const AMORTIZATIONVALUES = amortizations.map((amortization) => ({
		value: amortization.value,
		percent: amortization.valueprc,
	}));
	const AMORTIZATIONDATES = amortizations.map((amortization) => amortization.amortdate);

	return {
		COUPONVALUES,
		SECID,
		COUPONDATES,
		AMORTIZATIONVALUES,
		AMORTIZATIONDATES,
	};
};
