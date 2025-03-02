interface DBBond {
	id: string;
	SECID: string;
	quantity: number;
	purchasePrice: number | null;
	portfolioId: string;
	createdAt: Date;
	updatedAt: Date;
}

interface DBPortfolio {
	id: string;
	name: string;
	color: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	bonds: DBBond[];
}

interface DBUser {
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
	portfolios: DBPortfolio[];
}

// MOEX API Types
interface MOEXBondData {
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
	PREVPRICE?: number;
	LAST?: number;
	EFFECTIVEYIELD?: number;
	ACCRUEDINT?: number;
	DURATION?: number;
	DURATIONWAPRICE?: number;
	COUPONPERCENT?: number;
	CURRENTPRICE?: number;
	CURRENTYIELD?: number;
}

interface MOEXBondCoupons {
	COUPONVALUES: number[];
	COUPONDATES: string[];
}

interface Bond extends MOEXBondData, Partial<MOEXBondCoupons> {
	quantity: number;
	purchasePrice?: number | null;
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

// API Response Types
type APIResponse<T> = { data: T; error?: never } | { data?: never; error: string };

type BondAPIResponse = APIResponse<Bond[]>;
type PortfolioAPIResponse = APIResponse<DBPortfolio>;
