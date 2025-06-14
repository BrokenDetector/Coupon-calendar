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
	const returnPercentage = (priceDifference / Number(portfolioSummary.totalPurchasePrice)) * 100;
	const returnSymbol = isProfit ? "▲" : "▼";

	console.log(priceDifference);
	console.log(portfolioSummary);

	return (
		<Card className="col-span-4 xl:col-span-1 rounded-lg">
			<CardHeader>
				<CardTitle className="text-xl sm:text-2xl font-bold">Общая информация по портфелю</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Сумма инвестиций</p>
						<p className="text-lg sm:text-xl font-bold mt-1">
							{Number(portfolioSummary.totalPurchasePrice).toLocaleString("ru-RU")} ₽
						</p>
					</div>

					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Текущая стоимость</p>
						<p
							className={`text-lg sm:text-xl font-bold mt-1 ${
								isProfit ? "text-green-600" : "text-red-600"
							}`}
						>
							{Number(portfolioSummary.totalCurrentPrice).toLocaleString("ru-RU")} ₽{" "}
							<span className="text-sm">
								({returnSymbol} {priceDifference.toLocaleString("ru-RU")}, {returnPercentage.toFixed(2)}
								%)
							</span>
						</p>
					</div>

					<div>
						<TooltipProvider>
							<p className="text-sm sm:text-md font-semibold text-muted-foreground flex items-center gap-1">
								Средняя текущая доходность
								<Tooltip>
									<TooltipTrigger>
										<InfoIcon className="size-4 mt-1 text-muted-foreground" />
									</TooltipTrigger>
									<TooltipContent className="max-w-[300px] bg-muted text-foreground font-semibold">
										<p>Как рассчитывается:</p>
										<ul className="list-disc pl-4 space-y-1 mt-1">
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
							<p className="text-lg sm:text-xl font-bold mt-1">{portfolioSummary.averageCurrentYield}%</p>
						</TooltipProvider>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
