"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBonds } from "@/context/BondContext";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { sumCouponsByCurrency } from "@/helpers/sumCouponsByCurrency";
import { addMonths, format, getYear, isSameDay, parseISO, startOfYear } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC, useCallback, useState } from "react";
import MonthCalendar from "./MoutCalendar";

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

	const highlightedDates = () => {
		let dates: string[] = [];
		if (bonds.length > 0) {
			bonds.map((bond) => {
				bond.COUPONDATES!.map((date) => {
					dates.push(date);
				});
			});
		}
		return dates;
	};

	const months = Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(new Date(currentYear, 0)), i));
	const parsedHighlightedDates = highlightedDates().map((date) => parseISO(date));

	const handleDayClick = useCallback(
		(date: Date) => {
			const bondsWithCoupons = bonds.filter((bond) =>
				bond.COUPONDATES!.some((couponDate) => isSameDay(parseISO(couponDate), date))
			);

			const totalsByCurrency = sumCouponsByCurrency(bondsWithCoupons, (couponDate) =>
				isSameDay(couponDate, date)
			);

			setSelectedDate(date);
			setBondsForSelectedDate(bondsWithCoupons);
			setTotalCouponsByCurrency(totalsByCurrency);
			setIsModalOpen(true);
		},
		[bonds]
	);

	const changeYear = useCallback((increment: number) => {
		setCurrentYear((prevYear) => prevYear + increment);
	}, []);

	const calculateMonthlyCouponTotal = (month: Date) => {
		return sumCouponsByCurrency(
			bonds,
			(date) => date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()
		);
	};

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<Button onClick={() => changeYear(-1)}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<h1 className="text-2xl font-bold text-center">Календарь на {currentYear}</h1>
				<Button onClick={() => changeYear(1)}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
			<div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
				{months.map((month, index) => {
					const monthlyTotals = calculateMonthlyCouponTotal(month);

					return (
						<div
							key={index}
							className="flex flex-col gap-4 border-zinc-400 border rounded-lg items-center justify-between"
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
				<span>*Все платежи указаны без вычета налогов.</span>
				{!session?.data?.user && (
					<span>
						Хотите отслеживать выбранные облигации? Войдите или зарегистрируйтесь, чтобы сохранить их
						навсегда.
					</span>
				)}
			</div>

			<Dialog
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Купоны на {selectedDate ? format(selectedDate, "d MMMM, yyyy", { locale: ru }) : ""}
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{bondsForSelectedDate.length > 0 ? (
							<div className="grid gap-2">
								{bondsForSelectedDate.map((bond, index) => {
									const couponIndex = bond.COUPONDATES!.findIndex((couponDate) =>
										isSameDay(parseISO(couponDate), selectedDate!)
									);
									const couponValue = bond.COUPONVALUE![couponIndex];
									const quantity = bond.quantity || 1;
									const currencySymbol = getCurrencySymbol(bond.CURRENCY || "RUB");

									return (
										<div
											key={index}
											className="flex justify-between"
										>
											<span>
												{bond.SHORTNAME} (x{quantity})
											</span>
											<span>
												{couponValue
													? `${(couponValue * quantity).toFixed(2)} ${currencySymbol}`
													: "-"}
											</span>
										</div>
									);
								})}
								<div className="flex justify-between font-bold">
									<span>Сумма купонов за день:</span>
									<div>
										{Object.entries(totalCouponsByCurrency).map(([currency, total]) => (
											<div key={currency}>
												{total.toFixed(2)} {getCurrencySymbol(currency)}
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<p>Нет купонов в этот день.</p>
						)}
					</div>
					<DialogFooter>
						<Button onClick={() => setIsModalOpen(false)}>Закрыть</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CouponCalendar;
