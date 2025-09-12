import { addOrUpdatePortfolio, deletePortfolio } from "@/actions/portfolio-actions";
import { db } from "@/lib/db";
import { checkProtection } from "@/lib/protection";

jest.mock("@/lib/db", () => ({
	db: {
		portfolio: {
			findFirst: jest.fn(),
			create: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
}));

jest.mock("@/lib/protection", () => ({
	checkProtection: jest.fn(),
}));

const mockUser = {
	id: "user-123",
	portfolios: [{ id: "port-1" }, { id: "port-2" }, { id: "port-3" }, { id: "port-4" }, { id: "port-5" }],
};

const mockSession = { user: mockUser };

const validPortfolioData = {
	name: "My New Portfolio",
	color: "#ff0000",
};

describe("Server Actions: Portfolio Management", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("addOrUpdatePortfolio", () => {
		test("should return error if user is not authenticated", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ error: "Неавторизован." });

			const result = await addOrUpdatePortfolio({
				...validPortfolioData,
			});

			expect(result).toEqual({ error: "Неавторизован." });
			expect(db.portfolio.create).not.toHaveBeenCalled();
			expect(db.portfolio.update).not.toHaveBeenCalled();
		});

		test("should prevent creating more than 5 portfolios", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });

			const result = await addOrUpdatePortfolio({ ...validPortfolioData });

			expect(result).toEqual({ error: "Максимум 5 портфелей." });
			expect(db.portfolio.create).not.toHaveBeenCalled();
		});

		test("should allow creation if user has less than 5 portfolios", async () => {
			const userWith4Portfolios = { ...mockUser, portfolios: mockUser.portfolios.slice(0, 4) };
			(checkProtection as jest.Mock).mockResolvedValue({ session: { user: userWith4Portfolios } });

			const newPortfolio = { id: "new-port-1", ...validPortfolioData };

			(db.portfolio.create as jest.Mock).mockResolvedValue(newPortfolio);

			const result = await addOrUpdatePortfolio({ ...validPortfolioData });

			expect(result).toEqual({
				data: {
					newPortfolioId: "new-port-1",
					portfolioName: "My New Portfolio",
				},
			});

			expect(db.portfolio.create).toHaveBeenCalledWith({
				data: {
					name: "My New Portfolio",
					color: "#ff0000",
					userId: "user-123",
				},
			});
		});

		test("should update portfolio if id is provided and portfolio exists", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });

			const existingPortfolio = { id: "port-1", name: "Old Name", color: "#000", userId: "user-123" };

			(db.portfolio.findFirst as jest.Mock).mockResolvedValue(existingPortfolio);
			(db.portfolio.update as jest.Mock).mockResolvedValue({
				...existingPortfolio,
				name: "Updated Name",
				color: "#00ff00",
			});

			const result = await addOrUpdatePortfolio({
				id: "port-1",
				name: "Updated Name",
				color: "#00ff00",
			});

			expect(result).toEqual({
				data: {
					newPortfolioId: "port-1",
					portfolioName: "Updated Name",
				},
			});

			expect(db.portfolio.findFirst).toHaveBeenCalledWith({
				where: { id: "port-1", userId: "user-123" },
			});

			expect(db.portfolio.update).toHaveBeenCalledWith({
				where: { id: "port-1" },
				data: { name: "Updated Name", color: "#00ff00" },
			});
		});

		test("should allow updating portfolio when user has 5 portfolios", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });

			const existingPortfolio = { id: "port-1", name: "Old Name", color: "#000", userId: "user-123" };
			(db.portfolio.findFirst as jest.Mock).mockResolvedValue(existingPortfolio);
			(db.portfolio.update as jest.Mock).mockResolvedValue({
				...existingPortfolio,
				name: "Updated Name",
				color: "#00ff00",
			});

			const result = await addOrUpdatePortfolio({
				id: "port-1",
				name: "Updated Name",
				color: "#00ff00",
			});

			expect(result).toEqual({
				data: {
					newPortfolioId: "port-1",
					portfolioName: "Updated Name",
				},
			});
		});

		test("should return error if updating non-existent", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });
			(db.portfolio.findFirst as jest.Mock).mockResolvedValue(null);

			const result = await addOrUpdatePortfolio({
				id: "port-999",
				name: "My Portfolio",
				color: "#000",
			});

			expect(result).toEqual({ error: "Портфель не найден" });
			expect(db.portfolio.update).not.toHaveBeenCalled();
		});

		test("should handle errors during create/update", async () => {
			const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

			const userWith4Portfolios = { ...mockUser, portfolios: mockUser.portfolios.slice(0, 4) };
			(checkProtection as jest.Mock).mockResolvedValue({ session: { user: userWith4Portfolios } });
			(db.portfolio.create as jest.Mock).mockRejectedValue(new Error("Error during create/update"));

			const result = await addOrUpdatePortfolio({ ...validPortfolioData });

			expect(result).toEqual({ error: "Error during create/update" });
			expect(consoleSpy).toHaveBeenCalledWith("❗ERROR create or update portfolio:", expect.any(Error));

			consoleSpy.mockRestore();
		});
	});

	describe("deletePortfolio", () => {
		test("should return error if user is not authenticated", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ error: "Неавторизован." });

			const result = await deletePortfolio("port-1");

			expect(result).toEqual({ error: "Неавторизован." });
			expect(db.portfolio.findFirst).not.toHaveBeenCalled();
			expect(db.portfolio.delete).not.toHaveBeenCalled();
		});

		test("should return error if portfolio not found or not owned", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });
			(db.portfolio.findFirst as jest.Mock).mockResolvedValue(null);

			const result = await deletePortfolio("port-999");

			expect(result).toEqual({ error: "Портфель не найден" });
			expect(db.portfolio.delete).not.toHaveBeenCalled();
		});

		test("should delete portfolio if it exists and belongs to user", async () => {
			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });

			const portfolioToDelete = { id: "port-1", userId: "user-123" };
			(db.portfolio.findFirst as jest.Mock).mockResolvedValue(portfolioToDelete);
			(db.portfolio.delete as jest.Mock).mockResolvedValue(portfolioToDelete);

			const result = await deletePortfolio("port-1");

			expect(result).toEqual({ data: { success: true } });
			expect(db.portfolio.findFirst).toHaveBeenCalledWith({
				where: { id: "port-1", userId: "user-123" },
			});
			expect(db.portfolio.delete).toHaveBeenCalledWith({
				where: { id: "port-1" },
			});
		});

		test("should handle errors during deletion", async () => {
			const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

			(checkProtection as jest.Mock).mockResolvedValue({ session: mockSession });
			(db.portfolio.findFirst as jest.Mock).mockResolvedValue({ id: "port-1", userId: "user-123" });
			(db.portfolio.delete as jest.Mock).mockRejectedValue(new Error("Delete failed"));

			const result = await deletePortfolio("port-1");

			expect(result).toEqual({ error: "Delete failed" });
			expect(consoleSpy).toHaveBeenCalledWith("❗ERROR delete portfolio:", expect.any(Error));

			consoleSpy.mockRestore();
		});
	});
});
