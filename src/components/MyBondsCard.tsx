"use client";

import { useBonds } from "@/hooks/useBondContext";
import { FC } from "react";
import { columns } from "./BondTable/Columns";
import { DataTable } from "./BondTable/DataTable";
import SelectList from "./SelectList";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MyBondsCardProps {
	allBonds: Bond[];
	removeBond: (secId: string) => void;
	handlePriceBlur: (bond: Bond, newPrice: number) => void;
	addBond: (bond: Bond) => void;
}

const MyBondsCard: FC<MyBondsCardProps> = ({ allBonds, removeBond, handlePriceBlur, addBond }) => {
	const { bonds, setBonds } = useBonds();

	const handleQuantityChange = async (secId: string, value: number) => {
		setBonds((prev) => prev.map((b) => (b.SECID === secId ? { ...b, quantity: value } : b)));
	};

	const handlePriceChange = (secId: string, price: number) => {
		setBonds((prevBonds) => prevBonds.map((b) => (b.SECID === secId ? { ...b, purchasePrice: price } : b)));
	};

	const dataWithHandlers = bonds.map((bond) => ({
		...bond,
		removeBond: (secId: string) => removeBond(secId),
		handlePriceBlur: (bond: Bond, newPrice: number) => handlePriceBlur(bond, newPrice),
		handleQuantityBlur: (bond: Bond) => addBond(bond),
		handleQuantityChange,
		handlePriceChange,
	}));

	return (
		<Card className="rounded-lg col-span-4 xl:col-span-3">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-2xl font-bold">Мои облигации</CardTitle>
				<SelectList
					options={allBonds}
					onBondUpdate={addBond}
					bonds={bonds}
				/>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={dataWithHandlers}
				/>
			</CardContent>
		</Card>
	);
};

export default MyBondsCard;
