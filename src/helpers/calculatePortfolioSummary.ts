export const calculatePortfolioSummary = (
	bonds: Bond[],
	currencyRates: { [key: string]: { rate: number; name: string } } | null
) => {
	if (!currencyRates) {
		return {
			totalPurchasePrice: "0",
			totalCurrentPrice: "0",
			averageCurrentYield: "0",
		};
	}

	let totalPurchasePrice = 0;
	let totalCurrentPrice = 0;
	let totalCurrentYield = 0;
	let bondCountWithYield = 0;

	bonds.forEach((bond) => {
		const quantity = bond.quantity || 1;
		const nominalValue = bond.FACEVALUE || 0;
		const purchasePricePercent = bond.purchasePrice || 100;
		const currency = bond.FACEUNIT;
		const conversionRate = currency === "RUB" || currency === "SUR" ? 1 : currencyRates?.[currency].rate || 1;

		const purchaseValueInRUB = (purchasePricePercent / 100) * nominalValue * quantity * conversionRate;
		totalPurchasePrice += purchaseValueInRUB;

		const currentPricePercent = bond.LAST || bond.PREVPRICE || 0;
		const currentMarketValueInRUB = (currentPricePercent / 100) * nominalValue * quantity * conversionRate;
		totalCurrentPrice += currentMarketValueInRUB;

		if (currentPricePercent > 0) {
			const currentSingleBondValue = (currentPricePercent / 100) * nominalValue * conversionRate;
			const couponFrequency = bond.COUPONFREQUENCY || 365;
			const annualCouponPayment = (bond.COUPONVALUE || 0) * conversionRate * (365 / couponFrequency);

			const bondCurrentYield = (annualCouponPayment / currentSingleBondValue) * 100;
			totalCurrentYield += bondCurrentYield * quantity;
			bondCountWithYield += quantity;
		}

		// Add accrued coupon income to totalCurrentPrice
		totalCurrentPrice += (bond.ACCRUEDINT || 0) * quantity;
	});

	const averageCurrentYield = bondCountWithYield > 0 ? (totalCurrentYield / bondCountWithYield).toFixed(2) : "0";

	return {
		totalPurchasePrice: totalPurchasePrice.toFixed(2),
		totalCurrentPrice: totalCurrentPrice.toFixed(2),
		averageCurrentYield,
	};
};
