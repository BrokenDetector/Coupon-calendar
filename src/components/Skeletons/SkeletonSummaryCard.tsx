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
						<Skeleton className="h-7 sm:h-8 mt-1 w-full" />
					</div>

					<div>
						<p className="text-sm sm:text-md font-semibold text-muted-foreground">Текущая стоимость</p>
						<div className="space-y-1 mt-1">
							<Skeleton className="h-7 sm:h-8 w-full" />
						</div>
					</div>

					<div className="flex flex-col">
						<div className="flex items-center gap-1">
							<p className="text-sm sm:text-md font-semibold text-muted-foreground">
								Средняя текущая доходность
							</p>
						</div>
						<Skeleton className="h-7 sm:h-8 mt-1 w-full" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SkeletonSummaryCard;
