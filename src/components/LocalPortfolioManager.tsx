"use client";

import { fetchBonds } from "@/actions/fetch-bonds";
import CouponCalendar from "@/components/Calendar/Calendar";
import { calculatePortfolioSummary } from "@/helpers/calculatePortfolioSummary";
import { useBonds } from "@/hooks/useBondContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Link from "next/link";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import MyBondsCard from "./MyBondsCard";
import SummaryCard from "./SummaryCard";

interface LocalPortfolioManagerProps {
	allBonds: MOEXBondData[];
	currencyRates: {
		[key: string]: { rate: number; name: string; charCode: string };
	};
}

const LocalPortfolioManager: FC<LocalPortfolioManagerProps> = ({ allBonds, currencyRates }) => {
	const { bonds, setBonds } = useBonds();
	const { getLocalData, setLocalData } = useLocalStorage("BONDSECIDS");
	const initialLoadComplete = useRef(false);

	const checkAndRemoveMaturedBonds = useCallback(() => {
		const storedBonds = getLocalData() as Bond[];
		// Find bonds that no longer exist in MOEX
		const maturedBonds = storedBonds.filter((bond) => !allBonds.some((b) => b.SECID === bond.SECID));

		// If found any matured bonds, remove them
		if (maturedBonds.length > 0) {
			const updatedBonds = storedBonds.filter((bond) => !maturedBonds.some((mb) => mb.SECID === bond.SECID));
			setLocalData(updatedBonds);
			setBonds((prevBonds) => prevBonds.filter((bond) => !maturedBonds.some((mb) => mb.SECID === bond.SECID)));
			toast.success("Погашенные облигации удалены из портфеля");
		}
	}, [allBonds, getLocalData, setLocalData, setBonds]);

	useEffect(() => {
		const fetchLocalBonds = async () => {
			const bondSecids = getLocalData();
			const limitedBondSecids = bondSecids.slice(0, 10);

			if (limitedBondSecids.length > 0) {
				const toastId = toast.loading("Загрузка облигаций...");

				try {
					const response = await fetchBonds(limitedBondSecids, true);
					if (response instanceof Error) {
						throw new Error(`status: ${response.message}`);
					}
					setBonds(response);
					toast.success("Облигации загружены");

					// Check for matured bonds only after initial load
					initialLoadComplete.current = true;
					checkAndRemoveMaturedBonds();
				} catch (error) {
					console.error(`❗Error fetching bonds`, error);
					toast.error("Не удалось загрузить облигации");
				} finally {
					toast.dismiss(toastId);
				}
			} else {
				initialLoadComplete.current = true;
			}
		};

		fetchLocalBonds();
	}, [getLocalData, setBonds, checkAndRemoveMaturedBonds]);

	// Additional check for matured bonds on allBonds changes
	useEffect(() => {
		if (initialLoadComplete.current) {
			checkAndRemoveMaturedBonds();
		}
	}, [allBonds, checkAndRemoveMaturedBonds]);

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

			const bondIndex = currentBonds.findIndex((item: Bond) => item.SECID === SECID);
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

	return (
		<div className="flex flex-col space-y-4 mx-10">
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
				<SummaryCard portfolioSummary={portfolioSummary} />
				<MyBondsCard
					bonds={bonds}
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
