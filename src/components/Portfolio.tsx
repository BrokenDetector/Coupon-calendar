"use client";

import { X } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PortfolioProps {
	bonds: Bond[];
	portfolioName?: string;
	addBond: (updatedBonds: Bond) => void;
	removeBond: (SECID: string) => void;
}

const Portfolio: FC<PortfolioProps> = ({ bonds, portfolioName, addBond, removeBond }) => {
	const [quantities, setQuantities] = useState<Record<string, number>>({});

	useEffect(() => {
		if (bonds.length > 0) {
			const initialQuantities = bonds.reduce((acc, bond) => {
				acc[bond.SECID] = bond.quantity || 1;
				return acc;
			}, {} as Record<string, number>);
			setQuantities(initialQuantities);
		}
	}, [bonds]);

	const handleQuantityChange = useCallback((bond: Bond, value: number) => {
		if (!isNaN(value) && value > 0) {
			setQuantities((prev) => ({ ...prev, [bond.SECID]: value }));
		}
	}, []);

	const handleBlur = useCallback(
		(bond: Bond) => {
			const quantity = quantities[bond.SECID];
			if (quantity) {
				addBond({ ...bond, quantity });
			}
		},
		[quantities, addBond]
	);

	return (
		<div className="bg-card p-4 rounded-md border">
			<h2 className="text-lg font-semibold mb-2">{portfolioName || "Мой портфель"}</h2>
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
									value={quantities[bond.SECID] || 1}
									onChange={(e) => handleQuantityChange(bond, parseInt(e.target.value))}
									onBlur={() => handleBlur(bond)}
									onKeyDown={(e) => {
										if (e.keyCode === 13) {
											handleBlur(bond);
										}
									}}
									className="border p-1 rounded-md text-center max-w-28 overflow-hidden text-ellipsis"
								/>

								<Button
									onClick={() => removeBond(bond.SECID)}
									size={"icon"}
									className="p-1 m-3 bg-destructive hover:bg-destructive/90 rounded-lg h-fit"
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
	);
};

export default Portfolio;
