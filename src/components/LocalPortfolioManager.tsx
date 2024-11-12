"use client";

import CouponCalendar from "@/components/Calendar";
import Portfolio from "@/components/Portfolio";
import SelectList from "@/components/SelectList";
import { useBonds } from "@/hooks/useBondContext";
import { FC, useCallback, useEffect } from "react";
import {useLocalStorage} from "@/hooks/useLocalStorage";

interface LocalPortfolioManagerProps {
	allBonds: Bond[];
}

const LocalPortfolioManager: FC<LocalPortfolioManagerProps> = ({ allBonds }) => {
	const { bonds, setBonds } = useBonds();
	const { getLocalData, setLocalData } = useLocalStorage("BONDSECIDS");

	useEffect(() => {
		const storedBonds = getLocalData();
		if (storedBonds.length) setBonds(storedBonds);
	}, [getLocalData, setBonds]);

	const addBond = useCallback(
		(bond: Bond) => {
			const { SECID: secid, quantity } = bond;
			setBonds((prevBonds) =>
				prevBonds.some((b) => b.SECID === secid)
					? prevBonds.map((b) => (b.SECID === secid ? { ...b, quantity } : b))
					: [...prevBonds, bond]
			);

			const updatedData = getLocalData();
			const bondIndex = updatedData.findIndex((item: Bondsecid) => item.SECID === secid);
			if (bondIndex > -1) {
				updatedData[bondIndex].quantity = quantity!;
			} else {
				updatedData.push({ SECID: secid, quantity: quantity! });
			}
			setLocalData(updatedData);
		},
		[setBonds, getLocalData, setLocalData]
	);

	const removeBond = useCallback(
		(secid: string) => {
			setBonds((prev) => prev.filter((bond) => bond.SECID !== secid));

			const updatedStorage = getLocalData().filter((item: Bondsecid) => item.SECID !== secid);
			setLocalData(updatedStorage);
		},
		[setBonds, getLocalData, setLocalData]
	);

	return (
		<div className="grid grid-cols-4 mx-8 justify-between gap-2">
			<CouponCalendar bonds={bonds} />

			<div className="flex flex-col items-center p-2 col-span-1">
				<h1>Все облигации</h1>
				<SelectList options={allBonds} bonds={bonds} onBondUpdate={addBond} />
				<Portfolio addBond={addBond} bonds={bonds} removeBond={removeBond} />
			</div>
		</div>
	);
};

export default LocalPortfolioManager;
