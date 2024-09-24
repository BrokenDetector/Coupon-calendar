"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBonds } from "@/context/BondContext";
import { Bond } from "@/types/bond";
import { addMonths, format, getYear, isSameDay, parseISO, startOfYear } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FC, useCallback, useState } from "react";
import MonthCalendar from "./MoutCalendar";

const CouponCalendar: FC = () => {
	const [currentYear, setCurrentYear] = useState(getYear(new Date()));
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [bondsForSelectedDate, setBondsForSelectedDate] = useState<Bond[]>([]);
	const [totalCouponValue, setTotalCouponValue] = useState<number>(0);

	const { bonds } = useBonds();

	// Helper to get all highlighted dates
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

	// Calculate total coupon value for a specific day, considering bond quantity
	const handleDayClick = useCallback(
		(date: Date) => {
			const bondsWithCoupons = bonds.filter((bond) =>
				bond.COUPONDATES!.some((couponDate) => isSameDay(parseISO(couponDate), date))
			);

			// Calculate total coupon value for that day considering quantity
			const totalCouponValue = bondsWithCoupons.reduce((total, bond) => {
				const couponIndex = bond.COUPONDATES!.findIndex((couponDate) => isSameDay(parseISO(couponDate), date));
				if (couponIndex !== -1) {
					total += bond.COUPONVALUE![couponIndex] * (bond.quantity || 1); // Multiply by quantity
				}
				return total;
			}, 0);

			setSelectedDate(date);
			setBondsForSelectedDate(bondsWithCoupons);
			setTotalCouponValue(totalCouponValue);
			setIsModalOpen(true);
		},
		[bonds]
	);

	const changeYear = useCallback((increment: number) => {
		setCurrentYear((prevYear) => prevYear + increment);
	}, []);

	// Calculate total coupon value for the month, considering bond quantity
	const calculateMonthlyCouponTotal = (month: Date) => {
		return bonds.reduce((total, bond) => {
			bond.COUPONDATES!.forEach((couponDate, index) => {
				const date = parseISO(couponDate);
				if (date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()) {
					total += bond.COUPONVALUE![index] * (bond.quantity || 1); // Multiply by quantity
				}
			});
			return total;
		}, 0);
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
				{months.map((month, index) => (
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
							Сумма купонов за месяц: {calculateMonthlyCouponTotal(month).toFixed(2)} ₽
						</h5>
					</div>
				))}
			</div>
			<span className="text-xs text-muted-foreground italic p-4">
				* Все платежи указаны без вычета налогов и брокерских комиссий.
			</span>

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

									return (
										<div
											key={index}
											className="flex justify-between"
										>
											<span>
												{bond.SHORTNAME} (x{quantity})
											</span>
											<span>
												{couponValue ? `${(couponValue * quantity).toFixed(2)} ₽` : "-"}
											</span>
										</div>
									);
								})}
								<div className="flex justify-between font-bold">
									<span>Сумма купонов за день:</span>
									<span>{totalCouponValue.toFixed(2)} ₽</span>
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
