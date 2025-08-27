"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { InfoIcon } from "lucide-react";
import { FC, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SummaryCardProps {
	portfolioSummary: {
		totalPurchasePrice: string;
		totalCurrentPrice: string;
		averageCurrentYield: string;
	};
}

const formatNumber = (num: number, decimals: number = 0): string => {
	return num.toLocaleString("ru-RU", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: true,
	});
};

const SummaryCard: FC<SummaryCardProps> = ({ portfolioSummary }) => {
	const totalPurchase = Number(portfolioSummary.totalPurchasePrice);
	const totalCurrent = Number(portfolioSummary.totalCurrentPrice);
	const averageYield = Number(portfolioSummary.averageCurrentYield);

	const priceDifference = totalCurrent - totalPurchase;
	const isProfit = priceDifference > 0;
	const returnPercentage = (priceDifference / totalPurchase) * 100 || 0;
	const returnSymbol = isProfit ? "▲" : "▼";

	const purchaseRef = useRef<HTMLSpanElement>(null);
	const currentRef = useRef<HTMLSpanElement>(null);
	const yieldRef = useRef<HTMLSpanElement>(null);
	const priceDiffRef = useRef<HTMLSpanElement>(null);
	const returnPercentRef = useRef<HTMLSpanElement>(null);

	const [prevValues, setPrevValues] = useState({
		purchase: totalPurchase,
		current: totalCurrent,
		yield: averageYield,
		diff: priceDifference,
		percent: returnPercentage,
	});

	useGSAP(() => {
		if (purchaseRef.current) {
			const obj = { value: prevValues.purchase };
			gsap.to(obj, {
				value: totalPurchase,
				duration: 1,
				snap: { value: 1 },
				ease: "power1.out",
				onUpdate: () => {
					if (purchaseRef.current) {
						purchaseRef.current.innerText = formatNumber(obj.value);
					}
				},
			});
		}

		if (currentRef.current) {
			const obj = { value: prevValues.current };
			gsap.to(obj, {
				value: totalCurrent,
				duration: 1,
				snap: { value: 1 },
				ease: "power1.out",
				onUpdate: () => {
					if (currentRef.current) {
						currentRef.current.innerText = formatNumber(obj.value);
					}
				},
			});
		}

		if (yieldRef.current) {
			const obj = { value: prevValues.yield };
			gsap.to(obj, {
				value: averageYield,
				duration: 1,
				snap: { value: 0.01 },
				ease: "power1.out",
				onUpdate: () => {
					if (yieldRef.current) {
						yieldRef.current.innerText = formatNumber(obj.value, 2);
					}
				},
			});
		}

		if (priceDiffRef.current) {
			const obj = { value: prevValues.diff };
			gsap.to(obj, {
				value: priceDifference,
				duration: 1,
				snap: { value: 1 },
				ease: "power1.out",
				onUpdate: () => {
					if (priceDiffRef.current) {
						const value = obj.value;
						priceDiffRef.current.innerText = formatNumber(value);
					}
				},
			});
		}

		if (returnPercentRef.current) {
			const obj = { value: prevValues.percent };
			gsap.to(obj, {
				value: returnPercentage,
				duration: 1,
				snap: { value: 0.01 },
				ease: "power1.out",
				onUpdate: () => {
					if (returnPercentRef.current) {
						returnPercentRef.current.innerText = formatNumber(obj.value, 2);
					}
				},
			});
		}

		setPrevValues({
			purchase: totalPurchase,
			current: totalCurrent,
			yield: averageYield,
			diff: priceDifference,
			percent: returnPercentage,
		});
	}, [portfolioSummary]);

	return (
		<Card className="col-span-4 rounded-lg xl:col-span-1">
			<CardHeader>
				<CardTitle className="font-bold sm:text-xl">Общая информация по портфелю</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-1">
					<div>
						<p className="text-sm font-semibold sm:text-md text-muted-foreground">Сумма инвестиций</p>
						<p className="mt-1 text-lg font-bold">
							<span ref={purchaseRef}>{formatNumber(totalPurchase)}</span> ₽
						</p>
					</div>

					<div>
						<p className="text-sm font-semibold sm:text-md text-muted-foreground">Текущая стоимость</p>
						<p className={`text-lg font-bold mt-1 ${isProfit ? "text-green-600" : "text-red-600"}`}>
							<span ref={currentRef}>{formatNumber(totalCurrent)}</span> ₽{" "}
							<span className="inline-block text-sm whitespace-pre-line break-words break-all">
								<span className="inline-block">
									({returnSymbol} <span ref={priceDiffRef}>{formatNumber(priceDifference)}</span>{" "}
									<span
										className={`size-1 rounded-2xl inline-block align-middle ${
											isProfit ? "bg-green-600" : "bg-red-600"
										}`}
									/>{" "}
									<span ref={returnPercentRef}>{formatNumber(returnPercentage, 2)}</span>% )
								</span>
							</span>
						</p>
					</div>

					<div>
						<TooltipProvider>
							<p className="flex gap-1 items-center text-sm font-semibold sm:text-md text-muted-foreground">
								Средняя текущая доходность
								<Tooltip>
									<TooltipTrigger>
										<InfoIcon className="mt-1 size-4 text-muted-foreground" />
									</TooltipTrigger>
									<TooltipContent className="max-w-[300px] bg-muted text-foreground font-semibold">
										<p>Как рассчитывается:</p>
										<ul className="pl-4 mt-1 space-y-1 list-disc">
											<li>Доходность каждой облигации: (Годовой купон / Текущая цена) × 100%</li>
											<li>Учитываются только облигации с известной текущей ценой</li>
											<li>
												Среднее значение рассчитано с учётом доли каждой облигации в портфеле
											</li>
										</ul>
										<p className="mt-2 text-muted-foreground">
											Не включает НКД. Для точного расчёта доходности портфеля учитывайте все
											купонные выплаты.
										</p>
									</TooltipContent>
								</Tooltip>
							</p>
							<p className="mt-1 text-lg font-bold">
								<span ref={yieldRef}>{formatNumber(averageYield, 2)}</span>%
							</p>
						</TooltipProvider>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
