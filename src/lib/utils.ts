import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { randomUUID } from "crypto";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// for tests
export const mockBond = (overrides?: Partial<Bond>): Bond => {
	const ID = randomUUID();
	return {
		SECID: ID,
		FACEUNIT: "RUB",
		COUPONDATES: ["2024-01-15", "2024-02-15", "2024-03-15", "2024-04-15", "2024-05-15"],
		COUPONVALUES: [50, 55, 40],
		AMORTIZATIONDATES: ["2024-01-15", "2024-02-15", "2024-03-15", "2024-04-15", "2024-05-15"],
		AMORTIZATIONVALUES: [
			{ value: 200, percent: "20.00" },
			{ value: 200, percent: "20.00" },
			{ value: 200, percent: "20.00" },
			{ value: 200, percent: "20.00" },
			{ value: 200, percent: "20.00" },
		],
		quantity: 1,
		NAME: ID,
		SHORTNAME: ID,
		ISIN: ID,
		FACEVALUE: 1000,
		NEXTCOUPON: "2024-04-15",
		MATDATE: "2024-05-15",
		PREVPRICE: 1000,
		LAST: 100,
		EFFECTIVEYIELD: 0,
		ACCRUEDINT: 0,
		DURATION: 0,
		DURATIONWAPRICE: 0,
		COUPONPERCENT: 0,
		CURRENTYIELD: 0,
		TYPE: "Bond",
		CURRENTPRICE: 1000,
		purchasePrice: 100,
		...overrides,
	};
};
