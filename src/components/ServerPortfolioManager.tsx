"use client";

import { addOrUpdateBond, removeBondFromPortfolio } from "@/actions/bond-actions";
import CouponCalendar from "@/components/Calendar/Calendar";
import MyBondsCard from "@/components/MyBondsCard";
import SummaryCard from "@/components/SummaryCard";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { useBonds } from "@/hooks/useBondContext";
import { FC, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

interface ServerPortfolioManagerProps {
	allBonds: MOEXBondData[];
	currencyRates: {
		[key: string]: { rate: number; name: string; charCode: string };
	};
	portfolioId: string;
	initialBonds: Bond[];
}

const ServerPortfolioManager: FC<ServerPortfolioManagerProps> = ({
	allBonds,
	currencyRates,
	initialBonds,
	portfolioId,
}) => {
	const { bonds, setBonds } = useBonds();

	useEffect(() => {
		setBonds(initialBonds);
	}, [initialBonds, setBonds]);

	const portfolioSummary = useMemo(() => {
		return calculatePortfolioSummary(bonds, currencyRates);
	}, [bonds, currencyRates]);

	const checkAndRemoveMaturedBonds = useCallback(async () => {
		try {
			// Find bonds that no longer exist in MOEX
			const maturedBonds = initialBonds.filter((bond) => !allBonds.some((b) => b.SECID === bond.SECID));
			// If found any matured bonds, remove them
			if (maturedBonds.length > 0) {
				setBonds((prevBonds) =>
					prevBonds.filter((bond) => !maturedBonds.some((mb) => mb.SECID === bond.SECID))
				);

				for (const bond of maturedBonds) {
					await removeBondFromPortfolio(portfolioId, bond.SECID);
				}

				toast.success("Погашенные облигации удалены из портфеля");
			}
		} catch (error) {
			console.error("Failed to check matured bonds:", error);
		}
	}, [initialBonds, portfolioId, setBonds, allBonds]);

	useEffect(() => {
		checkAndRemoveMaturedBonds();
	}, [checkAndRemoveMaturedBonds]);

	const addBond = useCallback(
		async (bondToAdd: Bond) => {
			const { SECID, quantity } = bondToAdd;
			const bondExists = bonds.find((bond) => bond.SECID === SECID);

			if (bonds.length >= 50 && !bondExists) {
				toast.error("Максимум 50 облигаций");
				return;
			}

			const previousBonds = [...bonds];
			setBonds((prevBonds) =>
				bondExists
					? prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, quantity } : bond))
					: [...prevBonds, bondToAdd]
			);

			try {
				const response = await addOrUpdateBond(portfolioId, bondToAdd);

				if (response.error) {
					setBonds(previousBonds);
					toast.error(response.error);
				}
			} catch (error) {
				setBonds(previousBonds);
				toast.error("Ошибка при добавлении облигации");
				console.error("Failed to add bond:", error);
			}
		},
		[setBonds, portfolioId, bonds]
	);

	const removeBond = useCallback(
		async (SECID: string) => {
			const response = await removeBondFromPortfolio(portfolioId, SECID);

			if (response.error) {
				console.error(response.error);
				toast.error(response.error);
			} else {
				setBonds((prevBonds) => prevBonds.filter((bond) => bond.SECID !== SECID));
			}
		},
		[portfolioId, setBonds]
	);

	const handlePriceBlur = useCallback(
		async (bond: Bond, newPrice: number) => {
			if (typeof newPrice !== "number") {
				return;
			}
			try {
				const response = await addOrUpdateBond(portfolioId, { ...bond, purchasePrice: newPrice });

				if (response.error) {
					console.error(response.error);
					toast.error(response.error);
				}
			} catch (error) {
				console.error("❗Error updating purchase price", error);
				toast.error("Ошибка при обновлении цены покупки");
			}
		},
		[portfolioId]
	);

	return (
		<div className="flex flex-col space-y-4 mx-10">
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
				<SummaryCard portfolioSummary={portfolioSummary} />
				<MyBondsCard
					bonds={bonds}
					allBonds={allBonds}
					handlePriceBlur={handlePriceBlur}
					addBond={addBond}
					removeBond={removeBond}
				/>
			</div>
			<CouponCalendar />
		</div>
	);
};

export default ServerPortfolioManager;
