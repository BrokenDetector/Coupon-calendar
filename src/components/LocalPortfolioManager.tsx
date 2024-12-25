"use client";

import CouponCalendar from "@/components/Calendar";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { useBonds } from "@/hooks/useBondContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import MyBondsCard from "./MyBondsCard";
import SummaryCard from "./SummaryCard";

interface LocalPortfolioManagerProps {
	allBonds: Bond[];
}

const LocalPortfolioManager: FC<LocalPortfolioManagerProps> = ({ allBonds }) => {
	const { bonds, setBonds } = useBonds();
	const { getLocalData, setLocalData } = useLocalStorage("BONDSECIDS");
	const [currencyRates, setCurrencyRates] = useState<{
		[key: string]: { rate: number; name: string; charCode: string };
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCurrencyRates = async () => {
			const res = await fetch("/api/currency-exchange-rate");
			if (!res.ok) {
				const error = await res.json();
				console.error(error);
				toast.error(error.error);
			} else {
				const data = await res.json();
				setCurrencyRates(data.currencyRates);
			}
			setLoading(false);
		};

		fetchCurrencyRates();
	}, []);

	const portfolioSummary = useMemo(() => {
		return calculatePortfolioSummary(bonds, currencyRates);
	}, [bonds, currencyRates]);

	const addBond = useCallback(
		(bondToAdd: Bond) => {
			const { SECID, quantity, purchasePrice } = bondToAdd;
			const currentBonds = getLocalData();
			const bondExists = bonds.find((bond) => bond.SECID === SECID);

			if (currentBonds.length >= 10 && !bondExists) {
				toast((t) => (
					<div className="text-sm">
						<p className="text-base font bold">Вы достигли предела облигаций!</p>
						<p>
							<Link
								href="/auth?view=register"
								className="underline font-bold"
								onClick={() => toast.dismiss(t.id)}
							>
								Зарегистрируйтесь
							</Link>{" "}
							или{" "}
							<Link
								href="/auth?view=login"
								className="underline font-bold"
								onClick={() => toast.dismiss(t.id)}
							>
								войдите в аккаунт
							</Link>{" "}
							для увеличения лимита.
						</p>
					</div>
				));

				return;
			}

			setBonds((prevBonds) =>
				bondExists
					? prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, quantity } : bond))
					: [...prevBonds, bondToAdd]
			);

			const bondIndex = currentBonds.findIndex((item: Bondsecid) => item.SECID === SECID);
			if (bondIndex > -1) {
				currentBonds[bondIndex] = { SECID, quantity, purchasePrice };
			} else {
				currentBonds.push({ SECID, quantity, purchasePrice });
			}
			setLocalData(currentBonds);
		},
		[setBonds, bonds, getLocalData, setLocalData]
	);

	const removeBond = useCallback(
		(secid: string) => {
			const updatedStorage = bonds.filter((bond: Bond) => bond.SECID !== secid);
			setBonds((prev) => prev.filter((bond) => bond.SECID !== secid));

			setLocalData(updatedStorage);
		},
		[setBonds, setLocalData, bonds]
	);

	if (loading) {
		return (
			<div className="flex flex-col space-y-4 mx-10 size-full">
				{/* Skeleton for SummaryCard */}
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
					<Skeleton
						height={340}
						containerClassName="flex-1 col-span-4 xl:col-span-1 rounded-xl mx-4"
					/>
					{/* Skeleton for MyBondsCard */}
					<Skeleton
						count={7}
						height={45}
						containerClassName="flex-1 rounded-lg col-span-4 xl:col-span-3 mx-3"
					/>
				</div>

				{/* Skeleton for CouponCalendar */}
				<Skeleton
					height={500}
					containerClassName="flex-1 col-span-3 rounded-xl m-4"
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col space-y-4 mx-10">
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
				<SummaryCard portfolioSummary={portfolioSummary} />
				<MyBondsCard
					allBonds={allBonds}
					handlePriceBlur={(bond: Bond, newPrice: number) => addBond({ ...bond, purchasePrice: newPrice })}
					addBond={addBond}
					removeBond={removeBond}
				/>
			</div>
			<CouponCalendar />
		</div>
	);
};

export default LocalPortfolioManager;
