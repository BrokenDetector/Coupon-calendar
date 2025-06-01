"use client";

import CouponModal from "@/components/Calendar/CouponModal";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { sumCouponsByCurrency } from "@/helpers/sumCouponsByCurrency";
import { addMonths, getYear, isSameDay, parseISO, startOfYear } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FC, useCallback, useMemo, useState } from "react";
import MonthCalendar from "./MonthCalendar";

interface CouponCalendarProps {
	bonds: Bond[];
}

const CouponCalendar: FC<CouponCalendarProps> = ({ bonds }) => {
	const [currentYear, setCurrentYear] = useState(getYear(new Date()));
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [bondsForSelectedDate, setBondsForSelectedDate] = useState<Bond[]>([]);
	const [totalCouponsByCurrency, setTotalCouponsByCurrency] = useState<Record<string, number>>({});
	const session = useSession();

	const bondsSignature = useMemo(() => {
		return bonds.map((bond) => `${bond.SECID}:${bond.quantity}`).join("|");
	}, [bonds]);

	const highlightedDates = useMemo(() => {
		if (bonds.length > 0) {
			return bonds.reduce((dates: string[], bond) => {
				bond.COUPONDATES?.forEach((date) => dates.push(date));
				bond.AMORTIZATIONDATES?.forEach((date) => dates.push(date));
				return dates;
			}, []);
		}
		return [];
		// eslint-disable-next-line
	}, [bondsSignature]);

	const parsedHighlightedDates = useMemo(() => highlightedDates.map((date) => parseISO(date)), [highlightedDates]);

	const months = useMemo(
		() => Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(new Date(currentYear, 0)), i)),
		[currentYear]
	);

	const handleDayClick = useCallback(
		(date: Date) => {
			const bondsWithCoupons = bonds.filter(
				(bond) =>
					bond.COUPONDATES?.some((couponDate) => isSameDay(parseISO(couponDate), date)) ||
					bond.AMORTIZATIONDATES?.some((amortizationDate) => isSameDay(parseISO(amortizationDate), date))
			);
			console.log(bondsWithCoupons);
			const totalsByCurrency = sumCouponsByCurrency(bondsWithCoupons, (couponDate) =>
				isSameDay(couponDate, date)
			);

			setSelectedDate(date);
			setBondsForSelectedDate(bondsWithCoupons);
			setTotalCouponsByCurrency(totalsByCurrency);
			setIsModalOpen(true);
		},
		// eslint-disable-next-line
		[bondsSignature]
	);

	const changeYear = useCallback((increment: number) => {
		setCurrentYear((prevYear) => prevYear + increment);
	}, []);

	const calculateMonthlyTotal = useCallback(
		(month: Date) => {
			return sumCouponsByCurrency(
				bonds,
				(date) => date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()
			);
		},
		[bonds]
	);

	return (
		<div className="col-span-3 border rounded-lg bg-card/30 p-4">
			<div className="flex justify-between items-center mb-6">
				<Button onClick={() => changeYear(-1)}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-2xl font-bold text-center">Календарь на {currentYear}</h1>
				<Button onClick={() => changeYear(1)}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
			<div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-2 mb-6">
				{months.map((month, index) => {
					const monthlyTotals = calculateMonthlyTotal(month);

					return (
						<div
							key={index}
							className="flex flex-col gap-4 border rounded-lg items-center justify-between"
						>
							<MonthCalendar
								date={month}
								highlightedDates={parsedHighlightedDates}
								onDayClick={handleDayClick}
							/>
							<h5 className="text-sm font-bold px-4 pb-4 text-balance">
								Сумма выплат за месяц:
								{Object.entries(monthlyTotals).map(([currency, total]) => (
									<div key={currency}>
										{total.toFixed(2)} {getCurrencySymbol(currency)}
									</div>
								))}
							</h5>
						</div>
					);
				})}
			</div>
			<div className="flex flex-col text-xs text-muted-foreground italic p-4">
				<span>*Все платежи указаны без вычета налогов и комиссий.</span>
				{!session?.data?.user && (
					<div>
						<p>
							Хотите отслеживать выбранные облигации?{" "}
							<Link
								href="/auth?view=register"
								className="underline"
							>
								Войдите в аккаунт
							</Link>{" "}
							или{" "}
							<Link
								href="/auth?view=register"
								className="underline"
							>
								зарегистрируйтесь
							</Link>
							, чтобы сохранить их навсегда.{" "}
						</p>
					</div>
				)}
			</div>

			<CouponModal
				isModalOpen={isModalOpen}
				selectedDate={selectedDate}
				bondsForSelectedDate={bondsForSelectedDate}
				totalCouponsByCurrency={totalCouponsByCurrency}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
};

export default CouponCalendar;
