import { parseISO } from "date-fns";

export const sumCouponsByCurrency = (bonds: Bond[], dateFilter: (date: Date) => boolean) => {
	return bonds.reduce((totals, bond) => {
		bond.COUPONDATES!.forEach((couponDate, index) => {
			const date = parseISO(couponDate);
			if (dateFilter(date)) {
				const currency = bond.CURRENCY;
				const couponValue = bond.COUPONVALUE![index] * (bond.quantity || 1);
				if (!totals[currency]) {
					totals[currency] = 0;
				}
				totals[currency] += couponValue;
			}
		});
		return totals;
	}, {} as Record<string, number>);
};
