// "use server"; dont make it server and dont move it to api routes. Otherwise there is gonna be a lot of calls to MOEX API from one server

const createBondObject = (data: any): Bond => {
	const coupons = data[1]?.coupons;

	if (!coupons.length) {
		throw new Error("❗No coupon data available.");
	}

	const { isin: ISIN, name: SHORTNAME, secid: SECID, faceunit: CURRENCY } = coupons[0];

	const COUPONVALUE: number[] = [];
	const COUPONDATES: string[] = [];

	coupons.forEach((coupon: any) => {
		COUPONVALUE.push(coupon.value);
		COUPONDATES.push(coupon.coupondate);
	});

	return {
		SHORTNAME,
		COUPONVALUE,
		SECID,
		ISIN,
		CURRENCY,
		COUPONDATES,
	};
};

export const fetchBondCoupons = async (secid: string): Promise<Bond> => {
	try {
		const response = await fetch(
			`https://iss.moex.com/iss/securities/${secid}/bondization.json?iss.json=extended&iss.meta=off&iss.only=coupons&lang=ru&limit=unlimited`,
			{ next: { revalidate: 3600 } }
		);

		if (!response.ok) {
			throw new Error(`❗Failed to fetch bond coupons for ${secid}`);
		}

		const data = await response.json();
		return createBondObject(data);
	} catch (error) {
		console.error(`❗Error fetching coupons for bond ${secid}:`, error);
		throw error;
	}
};
