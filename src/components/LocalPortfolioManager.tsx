"use client";

import { fetchBonds } from "@/actions/bond-service";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { getErrorMessage } from "@/helpers/getErrorMessage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import CouponCalendar from "./Calendar/Calendar";
import MyBondsCard from "./MyBondsCard";
import SummaryCard from "./SummaryCard";
import { Button } from "./ui/button";
import { customToast } from "./ui/toast/toast-variants";
import { toast } from "./ui/toast/use-toast";

interface LocalPortfolioManagerProps {
	allBonds: MOEXBondData[];
	currencyRates: {
		[key: string]: { rate: number; name: string; charCode: string };
	};
	error?: string;
}

const LocalPortfolioManager: FC<LocalPortfolioManagerProps> = ({ allBonds, currencyRates, error }) => {
	const [bonds, setBonds] = useState<Bond[]>([]);
	const { getLocalData, setLocalData } = useLocalStorage("BONDSECIDS");

	const checkAndRemoveMaturedBonds = useCallback(() => {
		const storedBonds = getLocalData() as Bond[];
		// Find bonds that no longer exist in MOEX
		const maturedBonds = storedBonds.filter((bond) => !allBonds.some((b) => b.SECID === bond.SECID));

		// If found any matured bonds, remove them
		if (maturedBonds.length > 0) {
			const updatedBonds = storedBonds.filter((bond) => !maturedBonds.some((mb) => mb.SECID === bond.SECID));
			setLocalData(updatedBonds);
			setBonds((prevBonds) => prevBonds.filter((bond) => !maturedBonds.some((mb) => mb.SECID === bond.SECID)));
			customToast.success("Погашенные облигации удалены из портфеля");
		}
	}, [allBonds, getLocalData, setLocalData, setBonds]);

	useEffect(() => {
		const loadBonds = async () => {
			const storedBonds = getLocalData();
			if (storedBonds.length > 0) {
				try {
					const loadingToast = customToast.loading("Загрузка обллигаций...");

					const response = await fetchBonds(storedBonds.slice(0, 10), { includeCoupons: true });
					if (response.error) {
						loadingToast.dismiss();

						customToast.error(getErrorMessage(response.error));
					} else if (response.data) {
						loadingToast.dismiss();

						customToast.success("Облигации загружены");
						setBonds(response.data as Bond[]);
						checkAndRemoveMaturedBonds();
					}
				} catch (error) {
					console.error("❗Error loading bonds:", error);
					customToast.error("Не удалось загрузить облигации");
				}
			}
		};
		loadBonds();
	}, [getLocalData, checkAndRemoveMaturedBonds]);

	const portfolioSummary = useMemo(() => calculatePortfolioSummary(bonds, currencyRates), [bonds, currencyRates]);

	const handleQuantityChange = useCallback(
		(secId: string, value: number) => {
			setBonds((prev) => prev.map((b) => (b.SECID === secId ? { ...b, quantity: value } : b)));
		},
		[setBonds]
	);

	const handlePriceChange = useCallback(
		(secId: string, price: number) => {
			setBonds((prev) => prev.map((b) => (b.SECID === secId ? { ...b, purchasePrice: price } : b)));
		},
		[setBonds]
	);

	const handlePriceBlur = useCallback(
		(bond: Bond, newPrice: number) => {
			const currentBonds = getLocalData();
			const bondIndex = currentBonds.findIndex((b: Bond) => b.SECID === bond.SECID);
			if (bondIndex > -1) {
				currentBonds[bondIndex] = { ...currentBonds[bondIndex], purchasePrice: newPrice };
				setLocalData(currentBonds);
			}
		},
		[getLocalData, setLocalData]
	);

	const handleBondAdd = useCallback(
		(bondToAdd: Bond) => {
			const currentBonds = getLocalData();
			const { SECID, quantity, purchasePrice } = bondToAdd;
			const alreadyExists = bonds.some((b) => b.SECID === SECID);

			if (currentBonds.length >= 10 && !alreadyExists) {
				toast({
					variant: "default",
					title: "Вы достигли предела облигаций!",
					description: (
						<p>
							<Link
								href="/auth?view=register"
								className="font-bold underline"
							>
								Зарегистрируйтесь
							</Link>{" "}
							или{" "}
							<Link
								href="/auth?view=login"
								className="font-bold underline"
							>
								войдите в аккаунт
							</Link>{" "}
							для увеличения лимита.
						</p>
					),
					icon: <AlertCircle className="text-yellow-500 size-5 dark:text-yellow-400" />,
					className: "border-yellow-500 dark:border-yellow-400",
					duration: 10000,
				});
				return;
			}

			setBonds((prevBonds) =>
				alreadyExists
					? prevBonds.map((bond) => (bond.SECID === SECID ? { ...bond, quantity } : bond))
					: [...prevBonds, bondToAdd]
			);

			const bondIndex = currentBonds.findIndex((item: Bond) => item.SECID === SECID);
			if (bondIndex > -1) {
				currentBonds[bondIndex] = { SECID, quantity, purchasePrice };
			} else {
				currentBonds.push({ SECID, quantity, purchasePrice });
			}
			setLocalData(currentBonds);
		},
		[getLocalData, setLocalData, bonds]
	);

	const handleBondRemove = useCallback(
		(secId: string) => {
			const updatedStorage = bonds.filter((bond: Bond) => bond.SECID !== secId);
			setBonds((prev) => prev.filter((bond) => bond.SECID !== secId));

			setLocalData(updatedStorage);
		},
		[setLocalData, bonds]
	);

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-red-600">
				<p className="mb-2 text-lg font-semibold">Ошибка загрузки портфеля</p>
				<p className="mb-4 max-w-lg text-center">{getErrorMessage(error)}</p>
				<Button
					onClick={() => window.location.reload()}
					variant={"secondary"}
				>
					Попробовать снова
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col mx-10 space-y-4">
			<div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
				<SummaryCard portfolioSummary={portfolioSummary} />
				<MyBondsCard
					bonds={bonds}
					allBonds={allBonds}
					handleQuantityChange={handleQuantityChange}
					handlePriceChange={handlePriceChange}
					handlePriceBlur={handlePriceBlur}
					handleBondAdd={handleBondAdd}
					handleBondRemove={handleBondRemove}
				/>
			</div>
			<CouponCalendar bonds={bonds} />
		</div>
	);
};

export default LocalPortfolioManager;
