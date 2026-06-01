import { fetchBonds } from "@/actions/bond-service";
import { createBondObjectWithCoupons, createBondsWithData } from "@/helpers/createBondObjectWithData";
import { checkProtection } from "@/lib/protection";

jest.mock("@/helpers/createBondObjectWithData", () => ({
	createBondObjectWithCoupons: jest.fn(),
	createBondsWithData: jest.fn(),
}));

jest.mock("@/lib/protection", () => ({
	checkProtection: jest.fn(),
}));

describe("bond-service fetchBonds", () => {
	const fetchMock = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch = fetchMock as unknown as typeof fetch;
		(checkProtection as jest.Mock).mockResolvedValue({});
		fetchMock.mockResolvedValue({
			ok: true,
			json: jest.fn().mockResolvedValue({}),
		});
	});

	test("requests trimmed columns for the basic bond catalog", async () => {
		(createBondsWithData as jest.Mock).mockReturnValue([]);

		await fetchBonds("all", { detailLevel: "basic", checkAuth: false });

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("iss.only=securities%2Cmarketdata%2Cmarketdata_yields"),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("securities.columns=SECID%2CSHORTNAME%2CISIN%2CFACEUNIT"),
		);
		expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("marketdata.columns=SECID"));
		expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("marketdata_yields.columns=SECID"));
	});

	test("requests trimmed columns for portfolio hydration", async () => {
		(createBondsWithData as jest.Mock).mockReturnValue([
			{
				SECID: "BOND1",
			},
		]);

		await fetchBonds([{ SECID: "BOND1", quantity: 1, purchasePrice: 100 }], {
			includeCoupons: false,
			checkAuth: false,
		});

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("securities=BOND1"),
			expect.objectContaining({
				next: { revalidate: 3600 },
			}),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining(
				"securities.columns=SECID%2CSECNAME%2CSHORTNAME%2CISIN%2CFACEVALUE%2CNEXTCOUPON%2CCOUPONVALUE%2CCOUPONPERIOD%2CMATDATE%2CACCRUEDINT%2CFACEUNIT%2CCOUPONPERCENT%2CPREVPRICE%2CSECTYPE",
			),
			expect.any(Object),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("marketdata.columns=SECID%2CLAST%2CDURATION"),
			expect.any(Object),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("marketdata_yields.columns=SECID%2CEFFECTIVEYIELD%2CDURATIONWAPRICE"),
			expect.any(Object),
		);
		expect(createBondObjectWithCoupons).not.toHaveBeenCalled();
	});
});
