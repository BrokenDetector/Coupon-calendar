interface BondData {
	SECID: string;
	NAME: string;
	SHORTNAME: string;
	ISIN: string;
	FACEUNIT: string;
	FACEVALUE?: number;
	NEXTCOUPON?: string;
	COUPONVALUE?: number;
	COUPONFREQUENCY?: number;
	MATDATE?: string;
	PREVWAPRICE?: number;
	LAST?: number;
	EFFECTIVEYIELD?: number;
	ACCRUEDINT?: number;
	quantity?: number;
	purchasePrice?: number;
	DURATION?: number;
	DURATIONWAPRICE?: number;
	COUPONPERCENT?: number;
	CURRENTPRICE?: number;
	CURRENTYIELD?: number;
}

interface Bond extends BondData {
	NAME?: string;
	COUPONVALUES?: number[];
	COUPONDATES?: string[];
}

interface Bondsecid {
	SECID: string;
	quantity: number;
	purchasePrice?: string;
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
	isVerified: boolean;
	verificationToken?: string;
	verificationTokenExpires?: Date;
	resetPasswordToken?: string;
	resetPasswordTokenExpires?: Date;
}
