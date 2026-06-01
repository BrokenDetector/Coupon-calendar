import {
	BondObjectWithCoupons,
	createBondObjectWithCoupons,
	createBondsWithData,
	getCurrentYield,
	getNumberAt,
	getStringAt,
	getTypeName,
} from "@/helpers/createBondObjectWithData";
import { mockBond } from "@/lib/utils";

describe("Bond Data Helper Functions", () => {
	describe("createBondsWithData", () => {
		test("should handle missing marketdata or yieldData", () => {
			const data = {
				securities: {
					columns: [
						"SECID",
						"SECNAME",
						"SHORTNAME",
						"ISIN",
						"FACEVALUE",
						"NEXTCOUPON",
						"COUPONVALUE",
						"COUPONPERIOD",
						"MATDATE",
						"ACCRUEDINT",
						"FACEUNIT",
						"COUPONPERCENT",
						"PREVPRICE",
						"SECTYPE",
					],
					data: [
						[
							"BOND1",
							"Bond1",
							"Bond1",
							"RU1234567890",
							1000,
							"2024-01-15",
							50,
							4,
							"2030-01-15",
							10,
							"RUB",
							5,
							100,
							"3",
						],
					],
				},
				marketdata: {
					columns: ["SECID"],
					data: [], // Missing market data
				},
				marketdata_yields: {
					columns: ["SECID"],
					data: [], // Missing yield data
				},
			};

			const result = createBondsWithData(data);
			expect(result).toEqual([
				{
					SECID: "BOND1",
					NAME: "Bond1",
					SHORTNAME: "Bond1",
					ISIN: "RU1234567890",
					FACEVALUE: 1000,
					NEXTCOUPON: "2024-01-15",
					COUPONVALUE: 50,
					COUPONFREQUENCY: 4,
					MATDATE: "2030-01-15",
					ACCRUEDINT: 10,
					FACEUNIT: "RUB",
					COUPONPERCENT: 5,
					PREVPRICE: 100,
					LAST: 0,
					DURATION: 0,
					EFFECTIVEYIELD: 0,
					DURATIONWAPRICE: 0,
					TYPE: "ofz_bond",
					CURRENTPRICE: 100,
					CURRENTYIELD: 456.25,
				},
			]);
		});

		test("should throw error for empty securities data", () => {
			const emptyData = {
				securities: { columns: [], data: [] },
				marketdata: { columns: [], data: [] },
				marketdata_yields: { columns: [], data: [] },
			};

			expect(() => createBondsWithData(emptyData)).toThrow(
				"[MOEX ERROR] No securities data found for the given SECID(s).",
			);
		});
	});

	describe("getCurrentYield", () => {
		test("should calculate current yield correctly", () => {
			const bond = mockBond({
				COUPONVALUE: 50,
				COUPONFREQUENCY: 40,
			});

			const resultYield = getCurrentYield(bond);
			// Annual coupon = 50 * (365/4) = 4562.5
			// Current price = 1000 * (100/100) = 1000
			// Yield = (4562.5 / 1000) * 100 = 456.25%
			expect(resultYield).toBe(45.63);
		});

		test("should handle zero current price", () => {
			const bond = mockBond({
				LAST: 0,
				PREVPRICE: 0,
				COUPONVALUE: 50,
				COUPONFREQUENCY: 4,
			});

			const resultYield = getCurrentYield(bond);
			expect(resultYield).toBe(0);
		});

		test("should handle missing or zero COUPONVALUE", () => {
			const bond = mockBond({
				PREVPRICE: 0,
				COUPONVALUE: 0,
				COUPONFREQUENCY: 4,
			});
			const resultYield = getCurrentYield(bond);
			expect(resultYield).toBe(0);
		});

		test("should default to COUPONFREQUENCY of 365 if missing", () => {
			const bond = mockBond({ COUPONVALUE: 50, COUPONFREQUENCY: undefined });

			const resultYield = getCurrentYield(bond);
			// Annual coupon = 50 * (365/365) = 50
			// Current price = 1000 * (100/100) = 1000
			// Yield = (50 / 1000) * 100 = 5%
			expect(resultYield).toBe(5);
		});
	});

	describe("getTypeName", () => {
		test("should map security types correctly", () => {
			expect(getTypeName("3")).toBe("ofz_bond");
			expect(getTypeName("6")).toBe("corporate_bond");
			expect(getTypeName("7")).toBe("corporate_bond");
			expect(getTypeName("8")).toBe("corporate_bond");
			expect(getTypeName("4")).toBe("subfederal_bond");
			expect(getTypeName("C")).toBe("subfederal_bond");
			expect(getTypeName("unknown")).toBe("unknown");
		});
	});

	describe("getStringAt and getNumberAt", () => {
		const testRow = ["BOND1", 1000, "", null, undefined];

		test("getStringAt should handle various values", () => {
			expect(getStringAt(testRow, 0)).toBe("BOND1");
			expect(getStringAt(testRow, 1)).toBe("1000");
			expect(getStringAt(testRow, 2)).toBe("");
			expect(getStringAt(testRow, 3)).toBe("");
			expect(getStringAt(testRow, 4)).toBe("");
			expect(getStringAt(testRow, 999)).toBe(""); // Out of bounds
		});

		test("getNumberAt should handle various values", () => {
			expect(getNumberAt(testRow, 1)).toBe(1000);
			expect(getNumberAt(testRow, 2)).toBe(0); // Empty string
			expect(getNumberAt(testRow, 3)).toBe(0); // null
			expect(getNumberAt(testRow, 4)).toBe(0); // undefined
			expect(getNumberAt(testRow, 999)).toBe(0); // Out of bounds
			expect(getNumberAt(undefined, 0)).toBe(0); // Undefined row
		});
	});

	describe("createBondObjectWithCoupons", () => {
		test("should create bond object with coupons", () => {
			const data = [
				{ charsetinfo: { name: "utf-8" } },
				{
					coupons: [
						{ secid: "BOND1", value: 50, coupondate: "2024-01-15" },
						{ secid: "BOND1", value: 50, coupondate: "2024-07-15" },
					],

					amortizations: [{ secid: "BOND1", value: 1000, valueprc: "100", amortdate: "2030-01-15" }],
				},
			] as BondObjectWithCoupons;

			const result = createBondObjectWithCoupons(data);

			expect(result).toEqual({
				SECID: "BOND1",
				COUPONVALUES: [50, 50],
				COUPONDATES: ["2024-01-15", "2024-07-15"],
				AMORTIZATIONVALUES: [{ value: 1000, percent: "100" }],
				AMORTIZATIONDATES: ["2030-01-15"],
			});
		});

		test("should throw error for no coupon data", () => {
			const data = [
				{ charsetinfo: { name: "utf-8" } },
				{ coupons: [], amortizations: [] },
			] as BondObjectWithCoupons;

			expect(() => createBondObjectWithCoupons(data)).toThrow("❗No coupon data available.");
		});
	});
});
