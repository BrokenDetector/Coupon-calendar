interface Bond {
	SECID: string;
	SHORTNAME: string;
	COUPONVALUE?: number[];
	ISIN: string;
	COUPONDATES?: string[];
	CURRENCY: string;
	quantity?: number;
}

type BondResponse = [{ charsetinfo: { name: string } }, { securities: Bond[] }];

interface Bondsecid {
	SECID: string;
	quantity: number;
}

interface Portfolio {
	id: string;
	name: string;
	bonds: Bondsecid[];
}

interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
	portfolios: Portfolio[];
	password?: string;
}
