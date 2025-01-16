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
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	bonds: Bond[];
}

interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
	password?: string;
	emailVerified?: boolean;
	verificationToken?: string;
	verificationTokenExpires?: Date;
	resetPasswordToken?: string;
	resetPasswordTokenExpires?: Date;
	createdAt: Date;
	updatedAt: Date;
	portfolios: Portfolio[];
}

interface Account {
	id: string;
	userId: string;
	type: string;
	provider: string;
	providerAccountId: string;
	refresh_token?: string;
	access_token?: string;
	expires_at?: number;
	token_type?: string;
	scope?: string;
	id_token?: string;
	session_state?: string;
	createdAt: Date;
	updatedAt: Date;
}

interface Session {
	id: string;
	sessionToken: string;
	userId: string;
	expires: Date;
}

interface VerificationToken {
	id: string;
	identifier: string;
	token: string;
	expires: Date;
}

// For API responses
interface Bondsecid {
	SECID: string;
	quantity: number;
	purchasePrice?: string;
}
