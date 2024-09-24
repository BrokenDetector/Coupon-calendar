export interface Bond {
	SECID: string;
	SHORTNAME: string;
	COUPONVALUE?: number[];
	ISIN?: string;
	COUPONDATES?: string[];
	quantity?: number;
}

interface Bond2 extends Bond {
	REGNUMBER?: string;
}
export type BondResponse = [{ charsetinfo: { name: string } }, { securities: Bond2[] }];
