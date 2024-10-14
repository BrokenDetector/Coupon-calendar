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
			const { SECID: secid, quantity } = bond;

			setBonds((prevBonds) =>
				prevBonds.some((b) => b.SECID === secid)
					? prevBonds.map((b) => (b.SECID === secid ? { ...b, quantity } : b))
					: [...prevBonds, bond]
			);

			const oldLocalStorage = localStorage.getItem("BONDSECIDS");
			let updatedData: Bondsecid[] = [];

			if (oldLocalStorage) {
				updatedData = JSON.parse(oldLocalStorage);

				const bondIndex = updatedData.findIndex((item) => item.SECID === secid);
				if (bondIndex > -1) {
					updatedData[bondIndex].quantity = quantity!;
				} else {
					updatedData.push({ SECID: secid, quantity: quantity! });
				}
			} else {
				updatedData = [{ SECID: secid, quantity: quantity! }];
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
		<div className="flex flex-row justify-between gap-5">
			<CouponCalendar bonds={bonds} />

			<div className="flex flex-col items-center p-2">
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
