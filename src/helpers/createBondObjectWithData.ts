const getCurrentYield = (bond: MOEXBondData): number => {
	const nominalValue = bond.FACEVALUE || 0;
	const currentPrice = bond.LAST || bond.PREVWAPRICE || 0;
	const couponFrequency = bond.COUPONFREQUENCY || 365;
	const annualCouponPayment = (bond.COUPONVALUE || 0) * (365 / couponFrequency);

	if (currentPrice > 0) {
		const currentYield = (annualCouponPayment / ((currentPrice / 100) * nominalValue)) * 100;
		return parseFloat(currentYield.toFixed(2));
	}
	return 0;
};

const getCurrentPrice = (bond: MOEXBondData): number => {
	return bond.LAST || bond.PREVWAPRICE || 0;
};

const mapColumns = (columns: string[]): Record<string, number> => {
	return columns.reduce((acc, column, index) => {
		acc[column] = index;
		return acc;
	}, {} as Record<string, number>);
};

export const createBondsWithData = async (data: any): Promise<MOEXBondData[]> => {
	const securitiesColumns = mapColumns(data.securities.columns);
	const marketDataColumns = mapColumns(data.marketdata.columns);
	const yieldDataColumns = mapColumns(data.marketdata_yields.columns);

	const yieldDataMap = new Map<string, any>();
	data.marketdata_yields.data.forEach((yieldData: any) => {
		const secid = yieldData[yieldDataColumns["SECID"]];
		if (secid) {
			yieldDataMap.set(secid, yieldData);
		}
	});

	return data.securities.data.map((bondData: any) => {
		const secid = bondData[securitiesColumns["SECID"]];
		const marketData = data.marketdata.data.find((md: any) => md[marketDataColumns["SECID"]] === secid) || {};
		const yieldData = yieldDataMap.get(secid) || {};

		const bond = {
			SECID: secid,
			NAME: bondData[securitiesColumns["SECNAME"]],
			SHORTNAME: bondData[securitiesColumns["SHORTNAME"]],
			ISIN: bondData[securitiesColumns["ISIN"]],
			FACEVALUE: bondData[securitiesColumns["FACEVALUE"]],
			NEXTCOUPON: bondData[securitiesColumns["NEXTCOUPON"]],
			COUPONVALUE: bondData[securitiesColumns["COUPONVALUE"]],
			COUPONFREQUENCY: bondData[securitiesColumns["COUPONPERIOD"]],
			MATDATE: bondData[securitiesColumns["MATDATE"]],
			ACCRUEDINT: bondData[securitiesColumns["ACCRUEDINT"]],
			FACEUNIT: bondData[securitiesColumns["FACEUNIT"]],
			COUPONPERCENT: bondData[securitiesColumns["COUPONPERCENT"]],
			PREVWAPRICE: marketData[marketDataColumns["WAPRICE"]] || undefined,
			LAST: marketData[marketDataColumns["LAST"]] || undefined,
			DURATION: marketData[marketDataColumns["DURATION"]],
			EFFECTIVEYIELD: yieldData[yieldDataColumns["EFFECTIVEYIELD"]],
			DURATIONWAPRICE: yieldData[yieldDataColumns["DURATIONWAPRICE"]] || undefined,
		};

		return {
			...bond,
			CURRENTPRICE: getCurrentPrice(bond),
			CURRENTYIELD: getCurrentYield(bond),
		};
	});
};

export const createBondObjectWithCoupons = (data: any): MOEXBondCoupons & { SECID: string } => {
	const coupons = data[1]?.coupons;

	if (!coupons.length) {
		throw new Error("❗No coupon data available.");
	}

	const { secid: SECID } = coupons[0];

	const COUPONVALUES: number[] = coupons.map((coupon: any) => coupon.value);
	const COUPONDATES: string[] = coupons.map((coupon: any) => coupon.coupondate);

	return {
		COUPONVALUES,
		SECID,
		COUPONDATES,
	};
};
