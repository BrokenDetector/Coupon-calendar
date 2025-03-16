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
		const mockBondsWithUSD: Bond[] = [
			{
				SECID: "BOND2",
				NAME: "Test Bond 2",
				ISIN: "RU000A0001",
				SHORTNAME: "Test Bond 2",
				FACEVALUE: 1000,
				FACEUNIT: "USD",
				CURRENTPRICE: 110,
				purchasePrice: 100,
				LAST: 110,
				PREVPRICE: 100,
				COUPONVALUE: 50,
				COUPONFREQUENCY: 365,
				quantity: 5,
			},
		];

		const summary = calculatePortfolioSummary(mockBondsWithUSD, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "450000.00",
			totalCurrentPrice: "495000.00",
			averageCurrentYield: "4.55",
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
		const mockBondsWithZeroQuantity: Bond[] = [
			{
				SECID: "BOND3",
				NAME: "Test Bond 3",
				ISIN: "RU000A0002",
				SHORTNAME: "Test Bond 3",
				FACEVALUE: 1000,
				FACEUNIT: "RUB",
				CURRENTPRICE: 110,
				purchasePrice: 100,
				LAST: 110,
				PREVPRICE: 100,
				COUPONVALUE: 50,
				COUPONFREQUENCY: 120,
				quantity: 0,
			},
		];

		const summary = calculatePortfolioSummary(mockBondsWithZeroQuantity, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "1000.00",
			totalCurrentPrice: "1100.00",
			averageCurrentYield: "13.83",
		});
	});

	test("should handle bonds with missing COUPONVALUE or COUPONFREQUENCY", () => {
		const mockBondsWithMissingCouponData: Bond[] = [
			{
				SECID: "BOND5",
				NAME: "Test Bond 5",
				ISIN: "RU000A0004",
				SHORTNAME: "Test Bond 5",
				FACEVALUE: 1000,
				FACEUNIT: "RUB",
				CURRENTPRICE: 110,
				purchasePrice: 100,
				LAST: 110,
				PREVPRICE: 100,
				COUPONVALUE: undefined,
				COUPONFREQUENCY: undefined,
				quantity: 10,
			},
		];

		const summary = calculatePortfolioSummary(mockBondsWithMissingCouponData, mockCurrencyRates);

		expect(summary).toEqual({
			totalPurchasePrice: "10000.00",
			totalCurrentPrice: "11000.00",
			averageCurrentYield: "0.00",
		});
	});
});
