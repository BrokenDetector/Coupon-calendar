"use client";

import CouponCalendar from "@/components/Calendar";
import SummaryCard from "@/components/SummaryCard";
import BondsTable from "@/components/Table/BondsTable";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { useBonds } from "@/hooks/useBondContext";
import { FC, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ServerPortfolioManagerProps {
	allBonds: Bond[];
	initialBonds: Bond[];
	portfolioId: string;
}

const ServerPortfolioManager: FC<ServerPortfolioManagerProps> = ({ allBonds, initialBonds, portfolioId }) => {
	const { bonds, setBonds } = useBonds();
	const [currencyRates, setCurrencyRates] = useState<{ [key: string]: { rate: number; name: string } } | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setBonds(initialBonds);
	}, [initialBonds, setBonds]);

	useEffect(() => {
		const fetchCurrencyRates = async () => {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/currency-exchange-rate`);
			if (!res.ok) {
				const error = await res.json();
				console.log(error);
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

	if (loading) {
		return (
			<div className="flex flex-col space-y-4 mx-10 size-full">
				{/* Skeleton for SummaryCard */}
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
					<Skeleton
						height={340}
						containerClassName="flex-1 col-span-4 xl:col-span-1 rounded-xl mx-4"
					/>
					{/* Skeleton for BondsTable */}
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
				<BondsTable
					portfolioId={portfolioId}
					allBonds={allBonds}
				/>
			</div>
			<CouponCalendar />
		</div>
	);
};

export default ServerPortfolioManager;
