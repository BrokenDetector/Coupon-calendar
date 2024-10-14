"use client";

import { addBondToPortfolio } from "@/actions/add-bond";
import { removeBondFromPortfolio } from "@/actions/remove-bond";
import CouponCalendar from "@/components/Calendar";
import Portfolio from "@/components/Portfolio";
import SelectList from "@/components/SelectList";
import { debounce } from "@/lib/utils";
import { FC, useCallback, useState } from "react";
import toast from "react-hot-toast";

interface ServerPortfolioManagerProps {
	allBonds: Bond[];
	portfolioId: string;
	portfolioName: string;
	userId: string;
	initialBonds: Bond[];
}

const ServerPortfolioManager: FC<ServerPortfolioManagerProps> = ({
	allBonds,
	portfolioId,
	portfolioName,
	userId,
	initialBonds,
}) => {
	const [bonds, setBonds] = useState<Bond[]>(initialBonds);

	const debouncedUpdate = useCallback(
		debounce(async (updates) => {
			await addBondToPortfolio(portfolioId, updates, userId);
		}, 500),
		[portfolioId, userId]
	);

	const addBond = useCallback(
		(bondToAdd: Bond) => {
			const { SECID, quantity } = bondToAdd;

			setBonds((prevBonds) => {
				const bondExists = prevBonds.find((bond) => bond.SECID === SECID);

				if (prevBonds.length >= 20) {
					toast.error("Максимум 20 облигаций");
					return prevBonds;
				}

				const newBonds = bondExists
					? prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, quantity } : bond))
					: [...prevBonds, { ...bondToAdd, quantity }];

				debouncedUpdate(newBonds.map((bond) => ({ SECID: bond.SECID, quantity: bond.quantity! })));
				return newBonds;
			});
		},
		[debouncedUpdate]
	);

	const removeBond = useCallback(
		async (SECID: string) => {
			try {
				setBonds((prevBonds) => prevBonds.filter((bond) => bond.SECID !== SECID));
				await removeBondFromPortfolio(portfolioId, SECID, userId);
			} catch (error) {
				console.error("❗Failed to remove bond:", error);
			}
		},
		[portfolioId, userId]
	);

	return (
		<div className="flex flex-row justify-between gap-5">
			<CouponCalendar bonds={bonds} />

			<div className="flex flex-col items-center p-2">
				<h1>Все облигации</h1>
				<SelectList
					options={allBonds}
					onBondUpdate={addBond}
					bonds={bonds}
				/>
				<Portfolio
					addBond={addBond}
					removeBond={removeBond}
					bonds={bonds}
					portfolioName={portfolioName}
				/>
			</div>
		</div>
	);
};

export default ServerPortfolioManager;
