"use client";

import { X } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface PortfolioProps {
	quantities: { [SECID: string]: number };
	bonds: Bond[];
	portfolioName: string;
	addBond: (updatedBonds: Bond) => void;
	removeBond: (SECID: string) => void;
}

const Portfolio: FC<PortfolioProps> = ({ quantities, bonds, portfolioName, addBond, removeBond }) => {
	return (
		<div className="bg-secondary p-4 rounded-md border">
			<h2 className="text-lg font-semibold mb-2">{portfolioName}</h2>
			{bonds.length === 0 ? (
				<p className="text-muted-foreground">Облигации не добавлены</p>
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
									onChange={(e) => addBond({ ...bond, quantity: parseInt(e.target.value, 10) })}
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
	);
};

export default Portfolio;
