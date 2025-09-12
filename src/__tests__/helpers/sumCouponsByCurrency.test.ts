import { sumCouponsByCurrency } from "@/helpers/sumCouponsByCurrency";
import { mockBond } from "@/lib/utils";
import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";

describe("sumCouponsByCurrency", () => {
	test("should sum coupons and amortizations for 3 bonds and a specific month", () => {
		const targetMonth = new Date(2024, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});

		const result = sumCouponsByCurrency([mockBond({ quantity: 3 })], dateFilter);

		expect(result).toEqual({
			RUB: 750,
		});
	});

	test("should sum coupons and amortizations for multiple bonds with different currencies", () => {
		const targetMonth = new Date(2024, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});

		const mockBondsWithSameCurrency: Bond[] = [
			mockBond({ quantity: 3 }),
			mockBond({
				COUPONDATES: ["2024-01-15"],
				COUPONVALUES: [100],
				FACEUNIT: "USD",
				AMORTIZATIONDATES: ["2024-01-15"],
				AMORTIZATIONVALUES: [{ value: 1000, percent: "100" }],
			}),
		];

		const result = sumCouponsByCurrency(mockBondsWithSameCurrency, dateFilter);

		expect(result).toEqual({
			RUB: 750,
			USD: 1100,
		});
	});

	test("should handle empty bonds array", () => {
		const dateFilter = () => true;
		const result = sumCouponsByCurrency([], dateFilter);

		expect(result).toEqual({});
	});

	test("should handle bonds with no coupons and amortizations in filter period", () => {
		const targetMonth = new Date(2025, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});

		const result = sumCouponsByCurrency([mockBond()], dateFilter);

		expect(result).toEqual({});
	});

	test("should default to quantity of 1 when quantity is missing or zero and sum coupons and amortizations", () => {
		const bondWithoutQuantity: Bond[] = [mockBond({ quantity: 0 })];

		const targetMonth = new Date(2024, 0);
		const dateFilter = (date: Date) =>
			isWithinInterval(date, {
				start: startOfMonth(targetMonth),
				end: endOfMonth(targetMonth),
			});
		const result = sumCouponsByCurrency(bondWithoutQuantity, dateFilter);

		expect(result).toEqual({
			RUB: 250,
		});
	});
});
