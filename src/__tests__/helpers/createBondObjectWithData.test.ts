import { createBondsWithData, getCurrentYield } from "@/helpers/createBondObjectWithData";

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
					columns: ["SECID", "LAST", "DURATION"],
					data: [], // Missing market data
				},
				marketdata_yields: {
					columns: ["SECID", "EFFECTIVEYIELD", "DURATIONWAPRICE"],
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
					LAST: undefined,
					DURATION: undefined,
					EFFECTIVEYIELD: undefined,
					DURATIONWAPRICE: undefined,
					TYPE: "ofz_bond",
					CURRENTPRICE: 100,
					CURRENTYIELD: 456.25,
				},
			]);
		});
	});

	describe("getCurrentYield", () => {
		test("should calculate current yield correctly", () => {
			const bond: Partial<MOEXBondData> = {
				FACEVALUE: 1000,
				LAST: 100,
				COUPONVALUE: 50,
				COUPONFREQUENCY: 40,
				SECID: "BOND1",
				NAME: "Bond1",
				SHORTNAME: "Bond1",
				ISIN: "RU1234567890",
				FACEUNIT: "RUB",
			};

			const resultYield = getCurrentYield(bond);
			// Annual coupon = 50 * (365/4) = 4562.5
			// Current price = 1000 * (100/100) = 1000
			// Yield = (4562.5 / 1000) * 100 = 456.25%
			expect(resultYield).toBe(45.63);
		});

		test("should handle zero current price", () => {
			const bond: Partial<MOEXBondData> = {
				FACEVALUE: 1000,
				LAST: 0,
				PREVPRICE: 0,
				COUPONVALUE: 50,
				COUPONFREQUENCY: 4,
				SECID: "BOND1",
				NAME: "Bond1",
				SHORTNAME: "Bond1",
				ISIN: "RU1234567890",
				FACEUNIT: "RUB",
			};

			const resultYield = getCurrentYield(bond);
			expect(resultYield).toBe(0);
		});

		test("should handle missing or zero COUPONVALUE", () => {
			const bond: Partial<MOEXBondData> = {
				FACEVALUE: 1000,
				LAST: 100,
				COUPONVALUE: 0,
				COUPONFREQUENCY: 4,
				SECID: "BOND1",
				NAME: "Bond1",
				SHORTNAME: "Bond1",
				ISIN: "RU1234567890",
				FACEUNIT: "RUB",
			};

			const resultYield = getCurrentYield(bond);
			expect(resultYield).toBe(0);
		});

		test("should default to COUPONFREQUENCY of 365 if missing", () => {
			const bond: Partial<MOEXBondData> = {
				FACEVALUE: 1000,
				LAST: 100,
				COUPONVALUE: 50,
				COUPONFREQUENCY: undefined,
				SECID: "BOND1",
				NAME: "Bond1",
				SHORTNAME: "Bond1",
				ISIN: "RU1234567890",
				FACEUNIT: "RUB",
			};

			const resultYield = getCurrentYield(bond);
			// Annual coupon = 50 * (365/365) = 50
			// Current price = 1000 * (100/100) = 1000
			// Yield = (50 / 1000) * 100 = 5%
			expect(resultYield).toBe(5);
		});
	});
});
