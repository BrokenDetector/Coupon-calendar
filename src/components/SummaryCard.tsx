import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { FC } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SummaryCardProps {
	portfolioSummary: {
		totalPurchasePrice: string;
		totalCurrentPrice: string;
		averageCurrentYield: string;
	};
}

const SummaryCard: FC<SummaryCardProps> = ({ portfolioSummary }) => {
	const priceDifference = Number(portfolioSummary.totalCurrentPrice) - Number(portfolioSummary.totalPurchasePrice);

	const isProfit = priceDifference > 0;
	const returnPercentage = (priceDifference / Number(portfolioSummary.totalPurchasePrice)) * 100 || 0;
	const returnSymbol = isProfit ? "▲" : "▼";

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
							{Number(portfolioSummary.totalPurchasePrice).toLocaleString("ru-RU")} ₽
						</p>
					</div>

					<div>
						<p className="text-sm font-semibold sm:text-md text-muted-foreground">Текущая стоимость</p>
						<p className={`text-lg font-bold mt-1 ${isProfit ? "text-green-600" : "text-red-600"}`}>
							{Number(portfolioSummary.totalCurrentPrice).toLocaleString("ru-RU")} ₽{" "}
							<span className="text-sm">
								({returnSymbol} {priceDifference.toLocaleString("ru-RU")}{" "}
								<span
									className={`size-1 rounded-2xl inline-block align-middle ${
										isProfit ? "bg-green-600" : "bg-red-600"
									}`}
								/>{" "}
								{returnPercentage.toFixed(2)}
								%)
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
							<p className="mt-1 text-lg font-bold">{portfolioSummary.averageCurrentYield}%</p>
						</TooltipProvider>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
