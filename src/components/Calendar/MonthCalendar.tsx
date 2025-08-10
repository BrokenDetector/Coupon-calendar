"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { FC, memo } from "react";

const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface MonthCalendarProps {
	date: Date;
	highlightedDates: Date[];
	onDayClick: (date: Date) => void;
}

function capitalizeFirstLetter(string: string) {
	return string.replace(/^./, string[0].toUpperCase());
}

const MonthCalendar: FC<MonthCalendarProps> = memo(({ date, highlightedDates, onDayClick }) => {
	const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
	const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	const startDate = new Date(monthStart);
	startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
	const endDate = new Date(monthEnd);
	endDate.setDate(endDate.getDate() + (endDate.getDay() === 0 ? 0 : 7 - endDate.getDay()));

	const calendarDays = [];
	let currentDate = startDate;

	while (currentDate <= endDate) {
		calendarDays.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return (
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
	);
});

MonthCalendar.displayName = "MonthCalendar";
export default MonthCalendar;
