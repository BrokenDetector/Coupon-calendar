import { sumCouponsByCurrency } from "@/helpers/sumCouponsByCurrency";
import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";

describe("sumCouponsByCurrency", () => {
	const mockBonds: Bond[] = [
		{
			SECID: "BOND1",
			FACEUNIT: "RUB",
			COUPONDATES: ["2024-01-15", "2024-02-15", "2024-03-15"],
			COUPONVALUES: [50, 55, 40],
			quantity: 3,
			NAME: "Bond1",
			SHORTNAME: "Bond1",
			ISIN: "RU1234567890",
			FACEVALUE: 1000,
			NEXTCOUPON: "2024-04-15",
			MATDATE: "2024-05-15",
			PREVPRICE: 1000,
			LAST: 1000,
			EFFECTIVEYIELD: 0,
			ACCRUEDINT: 0,
			DURATION: 0,
			DURATIONWAPRICE: 0,
			COUPONPERCENT: 0,
			CURRENTYIELD: 0,
			TYPE: "Bond",
			CURRENTPRICE: 1000,
		},
		{
			SECID: "BOND2",
			FACEUNIT: "USD",
			COUPONDATES: ["2024-01-20", "2024-02-20"],
			COUPONVALUES: [100, 110],
			quantity: 1,
			NAME: "Bond2",
			SHORTNAME: "Bond2",
			ISIN: "RU1234567890",
			FACEVALUE: 1000,
			NEXTCOUPON: "2024-04-15",
			MATDATE: "2024-05-15",
			PREVPRICE: 1000,
			LAST: 1000,
			EFFECTIVEYIELD: 0,
			ACCRUEDINT: 0,
			DURATION: 0,
			DURATIONWAPRICE: 0,
			COUPONPERCENT: 0,
			CURRENTYIELD: 0,
			TYPE: "Bond",
			CURRENTPRICE: 1000,
		},
	];

	test("should sum coupons by currency for a specific month", () => {
		const targetMonth = new Date(2024, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});

		const result = sumCouponsByCurrency(mockBonds, dateFilter);

		expect(result).toEqual({
			RUB: 150,
			USD: 100,
		});
	});

	test("should sum coupons for multiple bonds with different currencies", () => {
		const targetMonth = new Date(2024, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});

		const mockBondsWithSameCurrency: Bond[] = [
			...mockBonds,
			{
				SECID: "BOND3",
				FACEUNIT: "RUB",
				COUPONDATES: ["2024-01-15"],
				COUPONVALUES: [100],
				quantity: 2,
				NAME: "Bond3",
				SHORTNAME: "Bond3",
				ISIN: "RU1234567890",
				FACEVALUE: 1000,
				NEXTCOUPON: "2024-04-15",
				MATDATE: "2024-05-15",
				PREVPRICE: 1000,
				LAST: 1000,
				EFFECTIVEYIELD: 0,
				ACCRUEDINT: 0,
				DURATION: 0,
				DURATIONWAPRICE: 0,
				COUPONPERCENT: 0,
				CURRENTYIELD: 0,
				TYPE: "Bond",
				CURRENTPRICE: 1000,
			},
		];

		const result = sumCouponsByCurrency(mockBondsWithSameCurrency, dateFilter);

		expect(result).toEqual({
			RUB: 350,
			USD: 100,
		});
	});

	test("should handle empty bonds array", () => {
		const dateFilter = () => true;
		const result = sumCouponsByCurrency([], dateFilter);

		expect(result).toEqual({});
	});

	test("should handle bonds with no coupons in filter period", () => {
		const targetMonth = new Date(2025, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});

		const result = sumCouponsByCurrency(mockBonds, dateFilter);

		expect(result).toEqual({});
	});

	test("should default to quantity of 1 when quantity is missing or zero", () => {
		const bondWithoutQuantity: Bond[] = [{ ...mockBonds[0], quantity: 0 }];

		const dateFilter = () => true;
		const result = sumCouponsByCurrency(bondWithoutQuantity, dateFilter);

		expect(result).toEqual({
			RUB: 145,
		});
	});
});
