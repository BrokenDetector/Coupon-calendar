"use client";

import CouponCalendar from "@/components/Calendar";
import Portfolio from "@/components/Portfolio";
import SelectList from "@/components/SelectList";
import { useBonds } from "@/context/BondContext";
import { FC, useCallback } from "react";

interface LocalPortfolioManagerProps {
	allBonds: Bond[];
}

const LocalPortfolioManager: FC<LocalPortfolioManagerProps> = ({ allBonds }) => {
	const { bonds, setBonds } = useBonds();

	const addBond = useCallback(
		(bond: Bond) => {
			setBonds((prevBonds) =>
				prevBonds.some((b) => b.SECID === bond.SECID)
					? prevBonds.map((b) => (b.SECID === bond.SECID ? { ...b, quantity: bond.quantity } : b))
					: [...prevBonds, bond]
			);

			const oldLocalStorage = localStorage.getItem("BONDSECIDS");
			const updatedData: Bondsecid[] = oldLocalStorage ? JSON.parse(oldLocalStorage) : [];

			const bondIndex = updatedData.findIndex((item) => item.SECID === bond.SECID);
			if (bondIndex > -1) {
				updatedData[bondIndex].quantity = bond.quantity!;
			} else {
				updatedData.push({ SECID: bond.SECID, quantity: bond.quantity! });
			}

			localStorage.setItem("BONDSECIDS", JSON.stringify(updatedData));
		},
		[setBonds]
	);

	const removeBond = useCallback(
		(secid: string) => {
			setBonds((prev) => prev.filter((bond) => bond.SECID !== secid));

			const oldStorage = localStorage.getItem("BONDSECIDS");
			if (oldStorage) {
				const data = JSON.parse(oldStorage) as Bondsecid[];
				const updatedStorage = data.filter((item) => item.SECID !== secid);
				localStorage.setItem("BONDSECIDS", JSON.stringify(updatedStorage));
			}
		},
		[setBonds]
	);

	return (
		<div className="grid grid-cols-4 mx-8 justify-between gap-2">
			<CouponCalendar bonds={bonds} />

			<div className="flex flex-col items-center p-2 col-span-1">
				<h1>Все облигации</h1>
				<SelectList
					options={allBonds}
					bonds={bonds}
					onBondUpdate={addBond}
				/>
				<Portfolio
					addBond={addBond}
					bonds={bonds}
					removeBond={removeBond}
				/>
			</div>
		</div>
	);
};

export default LocalPortfolioManager;
