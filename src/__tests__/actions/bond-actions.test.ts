import { addOrUpdateBond, removeBondFromPortfolio } from "@/actions/bond-actions";
import { db } from "@/lib/db";
import { getPortfolio } from "@/lib/db-helpers";
import { checkProtection } from "@/lib/protection";
import { mockBond } from "@/lib/utils";

jest.mock("@/lib/db", () => ({
	db: {
		bond: {
			upsert: jest.fn(),
			delete: jest.fn(),
		},
	},
}));

jest.mock("@/lib/db-helpers", () => ({
	getPortfolio: jest.fn(),
}));

jest.mock("@/lib/protection", () => ({
	checkProtection: jest.fn(),
}));

const bond = mockBond();

describe("Server Actions: Bond Management", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("addOrUpdateBond", () => {
		test("should return error if user is not authenticated", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ error: "Неавторизован." });

			const result = await addOrUpdateBond("port1", bond);

			expect(result).toEqual({ error: "Неавторизован." });
			expect(getPortfolio).not.toHaveBeenCalled();
			expect(db.bond.upsert).not.toHaveBeenCalled();
		});

		test("should return error if portfolio not found", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue(null);

			const result = await addOrUpdateBond("port1", bond);

			expect(result).toEqual({ error: "Портфель не найден." });
			expect(db.bond.upsert).not.toHaveBeenCalled();
		});

		test("should create a new bond if it does not exist", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue({ id: "port1" });
			(db.bond.upsert as jest.Mock).mockResolvedValue({});

			const result = await addOrUpdateBond("port1", bond);

			expect(result).toEqual({ data: { success: true } });
			expect(db.bond.upsert).toHaveBeenCalledWith({
				where: {
					SECID_portfolioId: {
						SECID: bond.SECID,
						portfolioId: "port1",
					},
				},
				update: {
					quantity: bond.quantity,
					purchasePrice: bond.purchasePrice,
				},
				create: {
					SECID: bond.SECID,
					quantity: bond.quantity,
					purchasePrice: bond.purchasePrice,
					portfolioId: "port1",
				},
			});
		});

		test("should handle errors during upsert", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue({ id: "port1" });
			(db.bond.upsert as jest.Mock).mockRejectedValue(new Error("DB Error"));

			const result = await addOrUpdateBond("port1", bond);

			expect(result).toEqual({ error: "DB Error" });
		});

		test("should use default quantity 1 if not provided", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue({ id: "port1" });
			(db.bond.upsert as jest.Mock).mockResolvedValue({});

			await addOrUpdateBond("port1", mockBond({ quantity: undefined }));

			expect(db.bond.upsert).toHaveBeenCalledWith(
				expect.objectContaining({
					create: expect.objectContaining({
						quantity: 1,
					}),
				})
			);
		});
	});

	describe("removeBondFromPortfolio", () => {
		test("should return error if user is not authenticated", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ error: "Неавторизован." });

			const result = await removeBondFromPortfolio("port1", "SU26218RMFS4");

			expect(result).toEqual({ error: "Неавторизован." });
			expect(db.bond.delete).not.toHaveBeenCalled();
		});

		test("should return error if portfolio not found", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue(null);

			const result = await removeBondFromPortfolio("port1", "SU26218RMFS4");

			expect(result).toEqual({ error: "Портфель не найден." });
			expect(db.bond.delete).not.toHaveBeenCalled();
		});

		test("should delete bond successfully", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue({ id: "port1" });
			(db.bond.delete as jest.Mock).mockResolvedValue({});

			const result = await removeBondFromPortfolio("port1", "SU26218RMFS4");

			expect(result).toEqual({ data: { success: true } });
			expect(db.bond.delete).toHaveBeenCalledWith({
				where: {
					SECID_portfolioId: {
						SECID: "SU26218RMFS4",
						portfolioId: "port1",
					},
				},
			});
		});

		test("should handle deletion error", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({});
			(getPortfolio as jest.Mock).mockResolvedValue({ id: "port1" });
			(db.bond.delete as jest.Mock).mockRejectedValue(new Error("Delete failed"));

			const result = await removeBondFromPortfolio("port1", "SU26218RMFS4");

			expect(result).toEqual({ error: "Delete failed" });
		});
	});
});
