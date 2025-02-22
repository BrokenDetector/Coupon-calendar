import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC } from "react";

interface SummaryCardProps {
	portfolioSummary: {
		totalPurchasePrice: string;
		totalCurrentPrice: string;
		averageCurrentYield: string;
	};
}

const SummaryCard: FC<SummaryCardProps> = ({ portfolioSummary }) => {
	const priceDifference = (
		Number(portfolioSummary.totalCurrentPrice.replace(/[^0-9.-]+/g, "")) -
		Number(portfolioSummary.totalPurchasePrice.replace(/[^0-9.-]+/g, ""))
	).toLocaleString("ru-RU", {
		style: "currency",
		currency: "RUB",
	});

	const isProfit = Number(priceDifference.replace(/[^0-9.-]+/g, "")) > 0;

	return (
		<Card className="col-span-4 xl:col-span-1 rounded-lg">
			<CardHeader>
				<CardTitle className="text-xl sm:text-2xl font-bold">Общая информация по портфелю</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Сумма инвестиций</p>
						<p className="text-lg sm:text-xl font-bold mt-1">{portfolioSummary.totalPurchasePrice} ₽</p>
					</div>
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">
							Текущая стоимость портфеля
						</p>
						<p className="text-lg sm:text-xl font-bold mt-1">{portfolioSummary.totalCurrentPrice} ₽</p>
					</div>
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Результат</p>
						<p
							className={`text-lg sm:text-xl font-bold mt-1 ${
								isProfit ? "text-green-600" : "text-red-600"
							}`}
						>
							{isProfit ? "+" : ""}
							{priceDifference}
						</p>
					</div>
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">
							Средняя текущая доходность
						</p>
						<p className="text-lg sm:text-xl font-bold mt-1">{portfolioSummary.averageCurrentYield}%</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
