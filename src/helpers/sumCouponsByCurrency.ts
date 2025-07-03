import { parseISO } from "date-fns";

export const sumCouponsByCurrency = (bonds: Bond[], dateFilter: (date: Date) => boolean) => {
	return bonds.reduce((totals, bond) => {
		bond.COUPONDATES!.forEach((couponDate, index) => {
			const date = parseISO(couponDate);
			if (dateFilter(date)) {
				const currency = bond.FACEUNIT;
				const couponValue = bond.COUPONVALUES![index] * (bond.quantity || 1);
				if (!totals[currency]) {
					totals[currency] = 0;
				}
				totals[currency] += couponValue;
			}
		});
		bond.AMORTIZATIONDATES?.forEach((amortizationDate, index) => {
			const date = parseISO(amortizationDate);
			if (dateFilter(date)) {
				const currency = bond.FACEUNIT;
				const amortizationValue = bond.AMORTIZATIONVALUES![index].value * (bond.quantity || 1);
				if (!totals[currency]) {
					totals[currency] = 0;
				}
				totals[currency] += amortizationValue;
			}
		});
		return totals;
	}, {} as Record<string, number>);
};
