import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonDataTable = () => {
	return (
		<Card className="col-span-5 rounded-lg xl:col-span-4">
			<CardHeader className="flex flex-col justify-between sm:flex-row sm:items-center">
				<CardTitle className="text-2xl font-bold">Мои облигации</CardTitle>
				<div className="flex flex-col gap-4">
					<Skeleton className="h-8 w-full sm:w-[200px]" />
					<Skeleton className="h-5 w-[160px]" />
				</div>
			</CardHeader>

			<CardContent>
				<div className="flex flex-row gap-2 mb-4 w-full sm:items-center sm:justify-between">
					<div className="flex flex-wrap flex-1 gap-2 items-center">
						<Skeleton className="h-8 max-w-full sm:max-w-sm min-w-[150px] flex-1" />
						<Skeleton className="size-8" />
					</div>

					<Skeleton className="size-8 sm:w-[150px] ml-auto" />
				</div>

				{/* Table rows skeleton */}
				<div className="rounded-md border">
					<div className="relative">
						{/* Header row */}
						<div className="flex gap-4 p-4 w-full">
							{Array(6)
								.fill(null)
								.map((_, i) => (
									<Skeleton
										key={i}
										className="flex-1 h-4"
									/>
								))}
						</div>

						{/* Data rows */}
						{Array(4)
							.fill(null)
							.map((_, i) => (
								<div
									key={i}
									className="flex gap-4 p-4 w-full"
								>
									{Array(6)
										.fill(null)
										.map((_, j) => (
											<Skeleton
												key={j}
												className="flex-1 h-10"
											/>
										))}
								</div>
							))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SkeletonDataTable;
