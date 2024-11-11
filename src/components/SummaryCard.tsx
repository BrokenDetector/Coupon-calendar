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
				<CardTitle className="text-2xl font-bold">Общая информация по портфелю</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-row xl:flex-col gap-3 justify-between items-baseline">
					<div>
						<p className="text-md font-semibold">Сумма инвестиций</p>
						<p className="font-bold">{portfolioSummary.totalPurchasePrice} ₽</p>
					</div>
					<div>
						<p className="text-md font-semibold">Текущая стоимость портфеля</p>
						<p className="font-bold">{portfolioSummary.totalCurrentPrice} ₽</p>
					</div>
					<div className="mt-4">
						<p className="text-md font-semibold">Результат</p>
						<p className={`text-xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
							{isProfit ? "+" : ""}
							{priceDifference}
						</p>
					</div>
					<div className="mt-4">
						<p className="text-md font-semibold">Средняя текущая доходность</p>
						<p className="font-bold">{portfolioSummary.averageCurrentYield}%</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
