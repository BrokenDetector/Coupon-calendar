"use client";

import { addOrUpdateBond, removeBondFromPortfolio } from "@/actions/bond-actions";
import CouponCalendar from "@/components/Calendar/Calendar";
import MyBondsCard from "@/components/MyBondsCard";
import SummaryCard from "@/components/SummaryCard";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { customToast } from "./ui/toast/toast-variants";

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
	const [bonds, setBonds] = useState<Bond[]>([]);

	const checkAndRemoveMaturedBonds = useCallback(async () => {
		try {
			// Find bonds that no longer exist in MOEX
			const maturedBonds = initialBonds.filter((bond) => !allBonds.some((b) => b.SECID === bond.SECID));

			// If found any matured bonds, remove them
			setBonds(initialBonds.filter((bond) => !maturedBonds.some((mb) => mb.SECID === bond.SECID)));
			if (maturedBonds.length > 0) {
				for (const bond of maturedBonds) {
					await removeBondFromPortfolio(portfolioId, bond.SECID);
				}

				customToast.success("Погашенные облигации удалены из портфеля");
			}
		} catch (error) {
			console.error("Failed to check matured bonds:", error);
		}
	}, [initialBonds, portfolioId, setBonds, allBonds]);

	useEffect(() => {
		checkAndRemoveMaturedBonds();
	}, [checkAndRemoveMaturedBonds]);

	const portfolioSummary = useMemo(() => calculatePortfolioSummary(bonds, currencyRates), [bonds, currencyRates]);

	const handleQuantityChange = useCallback(
		(secId: string, value: number) => {
			setBonds((prev) => prev.map((b) => (b.SECID === secId ? { ...b, quantity: value } : b)));
		},
		[setBonds]
	);

	const handlePriceChange = useCallback(
		(secId: string, price: number) => {
			setBonds((prev) => prev.map((b) => (b.SECID === secId ? { ...b, purchasePrice: price } : b)));
		},
		[setBonds]
	);

	const handlePriceBlur = useCallback(
		async (bond: Bond, newPrice: number) => {
			const response = await addOrUpdateBond(portfolioId, {
				...bond,
				purchasePrice: newPrice,
			});
			if (response.error) {
				customToast.error("Ошибка при обновлении цены покупки");
			}
		},
		[portfolioId]
	);

	const handleBondAdd = useCallback(
		async (bondToAdd: Bond) => {
			const prevBonds = [...bonds];

			setBonds((prev) => {
				const alreadyExists = prev.some((b) => b.SECID === bondToAdd.SECID);
				return alreadyExists
					? prev.map((b) => (b.SECID === bondToAdd.SECID ? bondToAdd : b))
					: [...prev, bondToAdd];
			});
			const response = await addOrUpdateBond(portfolioId, bondToAdd);
			if (response.error) {
				customToast.error("Ошибка при добавлении облигации");
				setBonds(prevBonds);
			}
		},
		[portfolioId, bonds]
	);

	const handleBondRemove = useCallback(
		async (secId: string) => {
			const prevBonds = [...bonds];

			setBonds((prev) => prev.filter((b) => b.SECID !== secId));
			const response = await removeBondFromPortfolio(portfolioId, secId);
			if (response.error) {
				customToast.error("Ошибка при удалении облигации");
				setBonds(prevBonds);
			}
		},
		[portfolioId, bonds]
	);

	return (
		<div className="flex flex-col space-y-4 mx-10">
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
				<SummaryCard portfolioSummary={portfolioSummary} />
				<MyBondsCard
					bonds={bonds}
					allBonds={allBonds}
					handleQuantityChange={handleQuantityChange}
					handlePriceChange={handlePriceChange}
					handlePriceBlur={handlePriceBlur}
					handleBondAdd={handleBondAdd}
					handleBondRemove={handleBondRemove}
				/>
			</div>
			<CouponCalendar bonds={bonds} />
		</div>
	);
};

export default ServerPortfolioManager;
