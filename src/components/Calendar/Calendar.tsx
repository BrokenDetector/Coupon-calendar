"use client";

import CouponModal from "@/components/Calendar/CouponModal";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import { addMonths, format, getYear, parseISO, startOfYear } from "date-fns";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FC, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import MonthCalendar from "./MonthCalendar";

interface CouponCalendarProps {
	bonds: Bond[];
}
interface Holiday {
	date: string;
	localName: string;
	name: string;
}

const CouponCalendar: FC<CouponCalendarProps> = ({ bonds }) => {
	const [currentYear, setCurrentYear] = useState(getYear(new Date()));
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [bondsForSelectedDate, setBondsForSelectedDate] = useState<Bond[]>([]);
	const [totalCouponsByCurrency, setTotalCouponsByCurrency] = useState<Record<string, number>>({});
	const [holidays, setHolidays] = useState<Record<number, Holiday[]>>({});
	const session = useSession();
	const deferredBonds = useDeferredValue(bonds);

	const calendarRef = useRef<HTMLDivElement>(null);
	const yearTitleRef = useRef<HTMLHeadingElement>(null);
	const monthGridRef = useRef<HTMLDivElement>(null);

	const fetchHolidays = async (year: number): Promise<Holiday[]> => {
		try {
			const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/RU`);
			if (!response.ok) throw new Error(`Failed to fetch holidays for ${year}`);
			return await response.json();
		} catch (error) {
			console.error("Error fetching holidays:", error);
			return [];
		}
	};

	useEffect(() => {
		const loadHolidays = async () => {
			const missingYears: number[] = [];
			if (!holidays[currentYear]) missingYears.push(currentYear);
			if (!holidays[currentYear + 1]) missingYears.push(currentYear + 1);

			if (missingYears.length > 0) {
				const results = await Promise.all(missingYears.map((y) => fetchHolidays(y)));
				setHolidays((prev) => {
					const next = { ...prev };
					missingYears.forEach((y, i) => {
						next[y] = results[i];
					});
					return next;
				});
			}
		};

		loadHolidays();
	}, [currentYear, holidays]);

	const adjustPaymentDate = (dateStr: string): Date => {
		const date = parseISO(dateStr);

		const isHoliday = (d: Date) => {
			const y = d.getFullYear();
			const yearHolidays = holidays[y] || [];
			const localDate = format(d, "yyyy-MM-dd");
			return yearHolidays.some((h) => h.date === localDate);
		};

		const isWeekend = (d: Date) => {
			const day = d.getDay();
			return day === 0 || day === 6;
		};

		const adjustedDate = new Date(date);
		while (isHoliday(adjustedDate) || isWeekend(adjustedDate)) {
			adjustedDate.setDate(adjustedDate.getDate() + 1);
		}

		return adjustedDate;
	};

	const bondsSignature = useMemo(() => {
		return deferredBonds.map((bond) => `${bond.SECID}:${bond.quantity}`).join("|");
	}, [deferredBonds]);

	const { highlightedDates, dayIndex, dayCurrencyTotals, monthCurrencyTotals } = useMemo(() => {
		const dayIndex: Record<string, Bond[]> = {};
		const dayCurrencyTotals: Record<string, Record<string, number>> = {};
		const monthCurrencyTotals: Record<string, Record<string, number>> = {};
		const dateSeen = new Set<string>();

		const addTotal = (
			bucket: Record<string, Record<string, number>>,
			key: string,
			currency: string,
			value: number
		) => {
			if (!bucket[key]) bucket[key] = {};
			if (!bucket[key][currency]) bucket[key][currency] = 0;
			bucket[key][currency] += value;
		};

		for (const bond of deferredBonds) {
			bond.COUPONDATES?.forEach((dateStr, idx) => {
				const adjusted = adjustPaymentDate(dateStr);
				const dateKey = format(adjusted, "yyyy-MM-dd");
				const monthKey = format(adjusted, "yyyy-MM");

				if (!dayIndex[dateKey]) dayIndex[dateKey] = [];
				if (!dayIndex[dateKey].some((b) => b.SECID === bond.SECID)) {
					dayIndex[dateKey].push(bond);
				}

				const currency = bond.FACEUNIT;
				const value = (bond.COUPONVALUES?.[idx] || 0) * (bond.quantity || 1);
				addTotal(dayCurrencyTotals, dateKey, currency, value);
				addTotal(monthCurrencyTotals, monthKey, currency, value);
				dateSeen.add(dateKey);
			});

			bond.AMORTIZATIONDATES?.forEach((dateStr, idx) => {
				const adjusted = adjustPaymentDate(dateStr);
				const dateKey = format(adjusted, "yyyy-MM-dd");
				const monthKey = format(adjusted, "yyyy-MM");

				if (!dayIndex[dateKey]) dayIndex[dateKey] = [];
				if (!dayIndex[dateKey].some((b) => b.SECID === bond.SECID)) {
					dayIndex[dateKey].push(bond);
				}

				const currency = bond.FACEUNIT;
				const value = (bond.AMORTIZATIONVALUES?.[idx]?.value || 0) * (bond.quantity || 1);
				addTotal(dayCurrencyTotals, dateKey, currency, value);
				addTotal(monthCurrencyTotals, monthKey, currency, value);
				dateSeen.add(dateKey);
			});
		}

		const highlightedDates = Array.from(dateSeen).map((k) => parseISO(k));
		return { highlightedDates, dayIndex, dayCurrencyTotals, monthCurrencyTotals };
		// eslint-disable-next-line
	}, [bondsSignature]);

	const months = useMemo(
		() => Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(new Date(currentYear, 0)), i)),
		[currentYear]
	);

	const handleDayClick = useCallback(
		(date: Date) => {
			const dateKey = format(date, "yyyy-MM-dd");
			const bondsWithPayments = dayIndex[dateKey] || [];
			const totalsByCurrency = dayCurrencyTotals[dateKey] || {};

			setSelectedDate(date);
			setBondsForSelectedDate(bondsWithPayments);
			setTotalCouponsByCurrency(totalsByCurrency);
			setIsModalOpen(true);
		},
		[dayIndex, dayCurrencyTotals]
	);

	const changeYear = useCallback((increment: number) => {
		setCurrentYear((prevYear) => prevYear + increment);
	}, []);

	const calculateMonthlyTotal = useCallback(
		(month: Date) => {
			const monthKey = format(month, "yyyy-MM");
			return monthCurrencyTotals[monthKey] || {};
		},
		[monthCurrencyTotals]
	);

	useGSAP(() => {
		if (yearTitleRef.current) {
			gsap.fromTo(
				yearTitleRef.current,
				{ opacity: 0, y: -10 },
				{ opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
			);
		}
	}, [currentYear]);

	useGSAP(() => {
		if (monthGridRef.current) {
			const monthElements = monthGridRef.current.children;
			gsap.fromTo(
				monthElements,
				{ opacity: 0, y: 20 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					stagger: 0.05,
					ease: "back.out(1.7)",
					delay: 0.2,
				}
			);
		}
	}, [currentYear]);

	return (
		<div
			className="col-span-3 p-4 rounded-lg border bg-card/30"
			ref={calendarRef}
		>
			<div className="flex justify-between items-center mb-6">
				<Button onClick={() => changeYear(-1)}>
					<ChevronLeft className="size-4" />
				</Button>
				<h1
					ref={yearTitleRef}
					className="text-xl font-bold text-center"
				>
					Календарь на {currentYear}
				</h1>
				<Button onClick={() => changeYear(1)}>
					<ChevronRight className="size-4" />
				</Button>
			</div>

			<div
				ref={monthGridRef}
				className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 mb-6"
			>
				{months.map((month, index) => {
					const monthlyTotals = calculateMonthlyTotal(month);

					return (
						<MonthCalendar
							key={index}
							date={month}
							highlightedDates={highlightedDates}
							monthlyTotals={monthlyTotals}
							onDayClick={handleDayClick}
						/>
					);
				})}
			</div>

			<div className="flex flex-col p-4 text-xs italic text-muted-foreground">
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
				adjustPaymentDate={adjustPaymentDate}
			/>
		</div>
	);
};

export default CouponCalendar;
