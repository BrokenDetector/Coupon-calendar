"use client";

import { addBondToPortfolio } from "@/actions/add-bond";
import { removeBondFromPortfolio } from "@/actions/remove-bond";
import CouponCalendar from "@/components/Calendar";
import { debounce } from "@/lib/utils";
import { FC, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Portfolio from "./Portfolio";
import SelectList from "./SelectList";

interface BondManagerProps {
	allBonds: Bond[];
	portfolioId: string;
	portfolioName: string;
	userId: string;
	initialBonds: Bond[];
	isMaxBonds: boolean;
}

const BondManager: FC<BondManagerProps> = ({
	allBonds,
	portfolioId,
	portfolioName,
	userId,
	initialBonds,
	isMaxBonds,
}) => {
	const [bonds, setBonds] = useState<Bond[]>(initialBonds);
	const [quantities, setQuantities] = useState<{ [SECID: string]: number }>({});
	const [pendingUpdates, setPendingUpdates] = useState<{ SECID: string; quantity: number }[]>([]);

	useEffect(() => {
		const initialQuantities = bonds.reduce((acc: { [SECID: string]: number }, bond) => {
			acc[bond.SECID] = bond.quantity || 1;
			return acc;
		}, {});
		setQuantities(initialQuantities);
	}, [bonds]);

	// Debounced function to update quantities in the backend
	const debouncedUpdate = useCallback(
		debounce(async (updates) => {
			await addBondToPortfolio(portfolioId, updates, userId);
		}, 500),
		[portfolioId, userId]
	);

	const addBond = useCallback(
		(bondToAdd: Bond) => {
			const { SECID, quantity: BondQuantity } = bondToAdd;
			const quantity = BondQuantity ?? 1;

			setQuantities((prevQuantities) => ({
				...prevQuantities,
				[SECID]: quantity,
			}));

			setBonds((prevBonds) => {
				const bondExists = prevBonds.some((bond) => bond.SECID === SECID);
				if (bondExists) {
					return prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, quantity } : bond));
				}
				if (isMaxBonds) {
					toast.error("Максимум 20 облигаций");
					return prevBonds;
				}
				return [...prevBonds, bondToAdd];
			});

			setPendingUpdates((prevUpdates) => {
				const bondExistsInUpdates = prevUpdates.some((update) => update.SECID === SECID);
				if (bondExistsInUpdates) {
					return prevUpdates.map((update) => (update.SECID === SECID ? { ...update, quantity } : update));
				}
				if (isMaxBonds) {
					toast.error("Максимум 20 облигаций");
					return prevUpdates;
				}
				return [...prevUpdates, { SECID, quantity }];
			});

			debouncedUpdate([...pendingUpdates, { SECID, quantity }]);
		},
		[debouncedUpdate, pendingUpdates, isMaxBonds]
	);

	const removeBond = useCallback(
		async (SECID: string) => {
			try {
				setBonds((prevBonds) => prevBonds.filter((bond) => bond.SECID !== SECID));
				setQuantities((prevQuantities) => {
					const newQuantities = { ...prevQuantities };
					delete newQuantities[SECID];
					return newQuantities;
				});

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
					onBondUpdate={(updatedBond) => {
						addBond(updatedBond);
					}}
					quantities={quantities}
				/>
				<Portfolio
					addBond={addBond}
					removeBond={removeBond}
					bonds={bonds}
					portfolioName={portfolioName}
					quantities={quantities}
				/>
			</div>
		</div>
	);
};

export default BondManager;
