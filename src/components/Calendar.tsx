"use client";

import CouponModal from "@/components/CouponModal";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { sumCouponsByCurrency } from "@/helpers/sumCouponsByCurrency";
import { useBonds } from "@/hooks/useBondContext";
import { addMonths, getYear, isSameDay, parseISO, startOfYear } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC, useCallback, useMemo, useState } from "react";
import MonthCalendar from "./MonthCalendar";

interface CouponCalendarProps {
	bonds?: Bond[];
}

const CouponCalendar: FC<CouponCalendarProps> = ({ bonds: bondsFromProps }) => {
	const [currentYear, setCurrentYear] = useState(getYear(new Date()));
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [bondsForSelectedDate, setBondsForSelectedDate] = useState<Bond[]>([]);
	const [totalCouponsByCurrency, setTotalCouponsByCurrency] = useState<Record<string, number>>({});
	const session = useSession();

	const { bonds: bondsFromContext } = useBonds();
	const bonds = bondsFromProps || bondsFromContext;

	const highlightedDates = useMemo(() => {
		if (bonds.length > 0) {
			return bonds.reduce((dates: string[], bond) => {
				bond.COUPONDATES?.forEach((date) => dates.push(date));
				return dates;
			}, []);
		}
		return [];
	}, [bonds.length]);

	const parsedHighlightedDates = useMemo(() => highlightedDates.map((date) => parseISO(date)), [highlightedDates]);

	const months = useMemo(
		() => Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(new Date(currentYear, 0)), i)),
		[currentYear]
	);

	const handleDayClick = useCallback(
		(date: Date) => {
			const bondsWithCoupons = bonds.filter((bond) =>
				bond.COUPONDATES?.some((couponDate) => isSameDay(parseISO(couponDate), date))
			);
			const totalsByCurrency = sumCouponsByCurrency(bondsWithCoupons, (couponDate) =>
				isSameDay(couponDate, date)
			);

			setSelectedDate(date);
			setBondsForSelectedDate(bondsWithCoupons);
			setTotalCouponsByCurrency(totalsByCurrency);
			setIsModalOpen(true);
		},
		[bonds.length]
	);

	const changeYear = useCallback((increment: number) => {
		setCurrentYear((prevYear) => prevYear + increment);
	}, []);

	const calculateMonthlyCouponTotal = useCallback(
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
					const monthlyTotals = calculateMonthlyCouponTotal(month);

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
								Сумма купонов за месяц:
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
					<span>
						Хотите отслеживать выбранные облигации? Войдите или зарегистрируйтесь, чтобы сохранить их
						навсегда.
					</span>
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
