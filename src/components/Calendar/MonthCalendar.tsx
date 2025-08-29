"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import gsap from "gsap";
import { FC, memo, useEffect, useRef, useState } from "react";

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface MonthCalendarProps {
	date: Date;
	highlightedDates: Date[];
	monthlyTotals: Record<string, number>;
	onDayClick: (date: Date) => void;
}

function capitalizeFirstLetter(string: string) {
	return string.replace(/^./, string[0].toUpperCase());
}

const MonthCalendar: FC<MonthCalendarProps> = memo(({ date, highlightedDates, monthlyTotals, onDayClick }) => {
	const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
	const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	const startDate = new Date(monthStart);
	startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
	const endDate = new Date(monthEnd);
	endDate.setDate(endDate.getDate() + (endDate.getDay() === 0 ? 0 : 7 - endDate.getDay()));

	const calendarDays = [];
	const currentDate = startDate;

	while (currentDate <= endDate) {
		calendarDays.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	const totalRefs = useRef<Record<string, HTMLSpanElement>>({});
	const [prevTotals, setPrevTotals] = useState<Record<string, number>>(monthlyTotals);

	useEffect(() => {
		setPrevTotals(monthlyTotals);
	}, [monthlyTotals]);

	useGSAP(() => {
		Object.entries(monthlyTotals).forEach(([currency, total]) => {
			const element = totalRefs.current[currency];
			if (element) {
				const prevTotal = prevTotals[currency] || 0;

				const obj = { value: prevTotal };
				gsap.to(obj, {
					value: total,
					duration: 1,
					snap: { value: 1 },
					ease: "power1.out",
					onUpdate: () => {
						element.textContent = obj.value.toFixed(2);
					},
					onComplete: () => {
						element.textContent = total.toFixed(2);
					},
				});
			}
		});
	}, [monthlyTotals]);

	return (
		<div className="flex flex-col gap-4 justify-between items-center rounded-xl border">
			<Card className="w-full">
				<CardHeader className="p-2">
					<CardTitle className="text-sm font-semibold text-center">
						{capitalizeFirstLetter(format(date, "LLLL yyyy", { locale: ru }))}
					</CardTitle>
				</CardHeader>
				<CardContent className="p-2">
					<div className="grid grid-cols-7 gap-1 text-center">
						{daysOfWeek.map((day, index) => (
							<span
								key={day}
								className={cn("font-medium", index >= 5 ? "text-destructive" : "text-muted-foreground")}
							>
								{day}
							</span>
						))}
						{calendarDays.map((day, index) => {
							const isWeekend = day.getDay() === 0 || day.getDay() === 6;
							const isHighlighted = highlightedDates.some((d) => isSameDay(d, day));

							return (
								<button
									key={index}
									className={`p-1 rounded cursor-pointer text-center ${
										day.getMonth() !== date.getMonth()
											? "text-muted-foreground"
											: isWeekend
											? "text-destructive"
											: ""
									} ${isHighlighted ? "bg-primary/80 hover:bg-primary/70" : ""}`}
									onClick={() => onDayClick(day)}
								>
									{format(day, "d")}
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>
			<h5 className="px-4 pb-4 text-sm font-bold text-balance">
				Сумма выплат за месяц:
				{Object.entries(monthlyTotals).map(([currency, total]) => (
					<div key={currency}>
						<span
							ref={(el) => {
								if (el) {
									totalRefs.current[currency] = el;
								}
							}}
						>
							{total.toFixed(2)}
						</span>{" "}
						{getCurrencySymbol(currency)}
					</div>
				))}
			</h5>
		</div>
	);
});

MonthCalendar.displayName = "MonthCalendar";
export default MonthCalendar;
