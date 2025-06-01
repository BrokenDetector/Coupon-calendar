import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";

describe("calculatePortfolioSummary", () => {
	const mockBonds: Bond[] = [
		{
			SECID: "BOND1",
			NAME: "Test Bond 1",
			ISIN: "RU000A0000",
			SHORTNAME: "Test Bond 1",
			FACEVALUE: 1000,
			FACEUNIT: "RUB",
			CURRENTPRICE: 110,
			purchasePrice: 100,
			LAST: 110,
			PREVPRICE: 100,
			COUPONVALUE: 50,
			COUPONFREQUENCY: 180,
			quantity: 10,
			NEXTCOUPON: "2025-01-01",
			MATDATE: "2025-01-01",
			EFFECTIVEYIELD: 0,
			ACCRUEDINT: 0,
			DURATION: 0,
			DURATIONWAPRICE: 0,
			COUPONPERCENT: 0,
			CURRENTYIELD: 0,
			TYPE: "Bond",
		},
	];

	const mockCurrencyRates = {
		RUB: { rate: 1, name: "Российский рубль" },
		USD: { rate: 90, name: "Доллар США" },
	};

	test("should calculate portfolio summary correctly", () => {
		const summary = calculatePortfolioSummary(mockBonds, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "10000.00",
			totalCurrentPrice: "11000.00",
			averageCurrentYield: "9.22",
		});
	});

	test("should handle bonds with different currencies", () => {
		const mockBondsWithUSD: Bond[] = [...mockBonds, { ...mockBonds[0], FACEUNIT: "USD", quantity: 1 }];

		const summary = calculatePortfolioSummary(mockBondsWithUSD, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "100000.00",
			totalCurrentPrice: "110000.00",
			averageCurrentYield: "9.22",
		});
	});

	test("should handle empty bonds array", () => {
		const summary = calculatePortfolioSummary([], mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "0.00",
			totalCurrentPrice: "0.00",
			averageCurrentYield: "0",
		});
	});

	test("should handle null currency rates", () => {
		const summary = calculatePortfolioSummary(mockBonds, null);

		expect(summary).toEqual({
			totalPurchasePrice: "0",
			totalCurrentPrice: "0",
			averageCurrentYield: "0",
		});
	});

	test("should handle bonds with missing or zero quantity", () => {
		const mockBondsWithZeroQuantity: Bond[] = [...mockBonds, { ...mockBonds[0], quantity: 0 }];

		const summary = calculatePortfolioSummary(mockBondsWithZeroQuantity, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "11000.00",
			totalCurrentPrice: "12100.00",
			averageCurrentYield: "9.22",
		});
	});

	test("should handle bonds with missing COUPONVALUE or COUPONFREQUENCY", () => {
		const mockBondsWithMissingCouponData: Bond[] = [
			{ ...mockBonds[0], COUPONVALUE: undefined, COUPONFREQUENCY: undefined },
		];

		const summary = calculatePortfolioSummary(mockBondsWithMissingCouponData, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "10000.00",
			totalCurrentPrice: "11000.00",
			averageCurrentYield: "0.00",
		});
	});
});
