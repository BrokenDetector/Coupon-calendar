"use client";

import { useBonds } from "@/hooks/useBondContext";
import Link from "next/link";
import { FC } from "react";
import { DataTable } from "./BondTable/DataTable";
import { columns } from "./BondTable/PortfolioColumns";
import SelectList from "./SelectList";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MyBondsCardProps {
	bonds: Bond[];
	allBonds: MOEXBondData[];
	removeBond: (secId: string) => void;
	handlePriceBlur: (bond: Bond, newPrice: number) => void;
	addBond: (bond: Bond) => void;
}

const MyBondsCard: FC<MyBondsCardProps> = ({ bonds, allBonds, removeBond, handlePriceBlur, addBond }) => {
	const { setBonds } = useBonds();

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
				<div>
					<Button
						variant="link"
						asChild
						className="ml-4 text-foreground text-sm p-0"
					>
						<Link href="/bonds">Список всех облигаций</Link>
					</Button>
					<SelectList
						options={allBonds}
						onBondUpdate={addBond}
						bonds={bonds}
					/>
				</div>
			</CardHeader>
			<CardContent className="max-h-[400px]">
				<DataTable
					columns={columns}
					data={dataWithHandlers}
					filterPlaceholder="Поиск по портфелю"
					maxHeight={"max-h-[320px]"}
				/>
			</CardContent>
		</Card>
	);
};

export default MyBondsCard;
