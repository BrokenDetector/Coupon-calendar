import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonSummaryCard = () => {
	return (
		<Card className="col-span-4 xl:col-span-1 rounded-lg">
			<CardHeader>
				<CardTitle className="text-xl sm:text-2xl font-bold">Общая информация по портфелю</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Сумма инвестиций</p>
						<Skeleton className="h-7 sm:h-8 mt-1" />
					</div>
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">
							Текущая стоимость портфеля
						</p>
						<Skeleton className="h-7 sm:h-8 mt-1" />
					</div>
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Результат</p>
						<Skeleton className="h-7 sm:h-8 mt-1" />
					</div>
					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">
							Средняя текущая доходность
						</p>
						<Skeleton className="h-7 sm:h-8 mt-1" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SkeletonSummaryCard;
