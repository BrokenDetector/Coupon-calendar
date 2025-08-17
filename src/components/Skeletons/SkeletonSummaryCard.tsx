import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonSummaryCard = () => {
	return (
		<Card className="col-span-4 rounded-lg xl:col-span-1">
			<CardHeader>
				<CardTitle className="font-bold sm:text-xl">Общая информация по портфелю</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-1">
					<div>
						<p className="text-sm font-semibold sm:text-md text-muted-foreground">Сумма инвестиций</p>
						<Skeleton className="mt-1 w-full h-7" />
					</div>

					<div>
						<p className="text-sm font-semibold sm:text-md text-muted-foreground">Текущая стоимость</p>
						<div className="mt-1 space-y-1">
							<Skeleton className="w-full h-7" />
						</div>
					</div>

					<div className="flex flex-col">
						<div className="flex gap-1 items-center">
							<p className="text-sm font-semibold sm:text-md text-muted-foreground">
								Средняя текущая доходность
							</p>
						</div>
						<Skeleton className="mt-1 w-full h-7" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SkeletonSummaryCard;
