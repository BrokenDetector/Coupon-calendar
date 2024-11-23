"use client";

import { fetchBondData } from "@/actions/fetch-bond";
import { useBonds } from "@/hooks/useBondContext";
import { debounce } from "@/lib/utils";
import { FC, useCallback } from "react";
import toast from "react-hot-toast";
import SelectList from "./SelectList";
import { columns } from "./BondTable/Columns";
import { DataTable } from "./BondTable/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MyBondsCardProps {
	allBonds: Bond[];
	portfolioId: string;
}

const MyBondsCard: FC<MyBondsCardProps> = ({ portfolioId, allBonds }) => {
	const { bonds, setBonds } = useBonds();

	const debouncedUpdate = useCallback(
		debounce(async (bondsToAdd: { SECID: string; quantity: number }[]) => {
			const response = await fetch("/api/add-bond", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ portfolioId, bondsToAdd }),
			});

			if (!response.ok) {
				const error = await response.json();
				console.log(error);
				toast.error(error.error);
			}
		}, 1000),
		[portfolioId]
	);

	const addBond = useCallback(
		async (bondsToAdd: Bond) => {
			const { SECID, quantity } = bondsToAdd;
			const bondData = await fetchBondData(bondsToAdd.SECID);

			setBonds((prevBonds) => {
				const bondExists = prevBonds.find((bond) => bond.SECID === SECID);

				if (prevBonds.length >= 20) {
					toast.error("Максимум 20 облигаций");
					return prevBonds;
				}

				const newBonds = bondExists
					? prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, ...bondData, quantity } : bond))
					: [...prevBonds, { ...bondsToAdd, ...bondData, quantity }];

				debouncedUpdate(newBonds.map((bond) => ({ SECID: bond.SECID, quantity: bond.quantity! })));
				return newBonds;
			});
		},
		[debouncedUpdate, setBonds]
	);

	const removeBond = useCallback(
		async (SECID: string) => {
			const response = await fetch("/api/remove-bond", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ portfolioId, secIdToRemove: SECID }),
			});

			if (!response.ok) {
				const error = await response.json();
				toast.error(error.error);
			} else {
				setBonds((prevBonds) => prevBonds.filter((bond) => bond.SECID !== SECID));
			}
		},
		[portfolioId, setBonds]
	);

	const handlePriceBlur = async (secid: string, newPrice: string) => {
		try {
			const response = await fetch("/api/update-purchase-price", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ portfolioId, secid, newPrice }),
			});

			if (!response.ok) {
				const error = await response.json();
				toast.error(error.error);
			}
		} catch (error) {
			console.error("Error updating purchase price", error);
			toast.error("Ошибка при обновлении цены покупки");
		}
	};

	const handleQuantityChange = (secId: string, value: number) => {
		if (!isNaN(value) && value > 0) {
			setBonds((prev) => prev.map((b) => (b.SECID === secId ? { ...b, quantity: value } : b)));
		}
	};

	const handlePriceChange = (secId: string, price: string) => {
		setBonds((prevBonds) => prevBonds.map((b) => (b.SECID === secId ? { ...b, purchasePrice: price } : b)));
	};

	const dataWithHandlers = bonds.map((bond) => ({
		...bond,
		removeBond: (secId: string) => removeBond(secId),
		handlePriceBlur: (secId: string, newPrice: string) => handlePriceBlur(secId, newPrice),
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
