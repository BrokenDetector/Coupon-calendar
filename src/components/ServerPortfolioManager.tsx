"use client";

import CouponCalendar from "@/components/Calendar";
import MyBondsCard from "@/components/MyBondsCard";
import SummaryCard from "@/components/SummaryCard";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { useBonds } from "@/hooks/useBondContext";
import { FC, useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
interface ServerPortfolioManagerProps {
	allBonds: Bond[];
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

	const addBond = useCallback(
		async (bondToAdd: Bond) => {
			const { SECID, quantity } = bondToAdd;
			const bondExists = bonds.find((bond) => bond.SECID === SECID);

			if (bonds.length >= 50 && !bondExists) {
				toast.error("Максимум 50 облигаций");
				return;
			}

			setBonds((prevBonds) =>
				bondExists
					? prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, quantity } : bond))
					: [...prevBonds, bondToAdd]
			);

			const response = await fetch("/api/add-bond", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ portfolioId, bondToAdd }),
			});

			if (!response.ok) {
				const error = await response.json();
				console.error(error);
				toast.error(error.error);
			}
		},
		[setBonds, portfolioId, bonds]
	);

	const removeBond = useCallback(
		async (SECID: string) => {
			const response = await fetch("/api/remove-bond", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ portfolioId, secIdToRemove: SECID }),
			});

			if (!response.ok) {
				const error = await response.json();
				toast.error(error.error);
			} else {
				setBonds((prevBonds) => prevBonds.filter((bond) => bond.SECID !== SECID));
			}
		},
		[portfolioId, setBonds]
	);

	const handlePriceBlur = useCallback(
		async (bond: Bond, newPrice: number) => {
			try {
				const response = await fetch("/api/update-purchase-price", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ portfolioId, secid: bond.SECID, newPrice }),
				});

				if (!response.ok) {
					const error = await response.json();
					toast.error(error.error);
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
