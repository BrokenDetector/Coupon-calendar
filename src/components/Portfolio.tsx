"use client";

import { useBonds } from "@/context/BondContext";
import { Bond } from "@/types/bond";
import { X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import SelectList from "./SelectList";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PortfolioProps {
	allBonds: Bond[];
}

const Portfolio: FC<PortfolioProps> = ({ allBonds }) => {
	const { bonds, setBonds } = useBonds();
	const [quantities, setQuantities] = useState<{ [secid: string]: number }>({}); // Track quantities by secid

	useEffect(() => {
		const initialQuantities = bonds.reduce((acc: { [secid: string]: number }, bond) => {
			acc[bond.SECID] = bond.quantity || 1; // Default to 1 if no quantity is set
			return acc;
		}, {});
		setQuantities(initialQuantities);
	}, [bonds]);

	const handleQuantityChange = (secid: string, newQuantity: number) => {
		// Update quantity in state
		setQuantities((prevQuantities) => ({
			...prevQuantities,
			[secid]: newQuantity,
		}));

		// Update quantity in bonds state
		setBonds((prevBonds) =>
			prevBonds.map((bond) => (bond.SECID === secid ? { ...bond, quantity: newQuantity } : bond))
		);

		// Update quantity in local storage
		const updatedBonds = bonds.map(
			(bond) =>
				bond.SECID === secid
					? { SECID: bond.SECID, quantity: newQuantity } // Store only SECID and quantity
					: { SECID: bond.SECID, quantity: bond.quantity || 1 } // Ensure all bonds have SECID and quantity
		);

		localStorage.setItem("BONDSECIDS", JSON.stringify(updatedBonds));
	};

	const removeBond = (secid: string) => {
		setBonds((prev) => prev.filter((bond) => bond.SECID !== secid));

		// Update local storage
		const oldStorage = JSON.parse(localStorage.getItem("BONDSECIDS")!) as { SECID: string; quantity: string }[];
		const updatedStorage = oldStorage.filter((item) => item.SECID === secid);

		localStorage.setItem("BONDSECIDS", JSON.stringify(updatedStorage));

		// Remove from quantities state
		setQuantities((prevQuantities) => {
			const newQuantities = { ...prevQuantities };
			delete newQuantities[secid];
			return newQuantities;
		});
	};

	return (
		<div className="flex flex-col items-center p-2">
			<h1>Все облигации</h1>
			<SelectList options={allBonds} />

			<div className="bg-secondary p-4 rounded-md">
				<h2 className="text-lg font-semibold mb-2">Мой портфель</h2>
				{bonds.length === 0 ? (
					<p className="text-muted-foreground">Облигации не добавлены </p>
				) : (
					<ul
						className="space-y-2"
						aria-label="List of selected bonds"
					>
						{bonds.map((bond, index) => (
							<li
								key={index}
								className="grid grid-cols-3 items-center justify-between space-x-3 bg-background p-2 rounded-md"
							>
								<span className="text-sm">{bond.SHORTNAME}</span>
								<div className="flex flex-row items-center justify-center col-span-2 space-x-2">
									<span className="text-sm text-muted-foreground">x</span>
									<Input
										type="number"
										min="1"
										max="1000000"
										value={quantities[bond.SECID] || 1}
										onChange={(e) => handleQuantityChange(bond.SECID, parseInt(e.target.value))}
										className="border border-zinc-600 p-1 rounded-md text-center max-w-28 overflow-hidden text-ellipsis"
									/>

									<Button
										onClick={() => removeBond(bond.SECID)}
										size={"icon"}
										className="p-1 m-3 bg-red-500 hover:bg-red-600 rounded-lg h-fit"
										aria-label={`Remove ${bond.SHORTNAME}`}
									>
										<X className="size-4" />
									</Button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default Portfolio;
