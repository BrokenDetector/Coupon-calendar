"use client";

import { addOrUpdateBond, removeBondFromPortfolio } from "@/actions/bond-actions";
import CouponCalendar from "@/components/Calendar/Calendar";
import MyBondsCard from "@/components/MyBondsCard";
import SummaryCard from "@/components/SummaryCard";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { getErrorMessage } from "@/helpers/getErrorMessage";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { customToast } from "./ui/toast/toast-variants";

interface ServerPortfolioManagerProps {
	allBonds: MOEXBondData[];
	currencyRates: {
		[key: string]: { rate: number; name: string; charCode: string };
	};
	portfolioId: string;
	initialBonds: Bond[];
	error?: string;
}

const ServerPortfolioManager: FC<ServerPortfolioManagerProps> = ({
	allBonds,
	currencyRates,
	initialBonds,
	portfolioId,
	error,
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
		if (!error) {
			checkAndRemoveMaturedBonds();
		}
	}, [checkAndRemoveMaturedBonds, error]);

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

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-red-600">
				<p className="mb-2 text-lg font-semibold">Ошибка загрузки портфеля</p>
				<p className="mb-4 max-w-lg text-center">{getErrorMessage(error)}</p>
				<Button
					onClick={() => window.location.reload()}
					variant={"secondary"}
				>
					Попробовать снова
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col mx-10 space-y-4">
			<div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
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
