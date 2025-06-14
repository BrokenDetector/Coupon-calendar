import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonDataTable = () => {
	return (
		<Card className="col-span-4 xl:col-span-3 rounded-lg">
			<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<CardTitle className="text-2xl font-bold">Мои облигации</CardTitle>
				<div className="flex flex-col gap-4">
					<Skeleton className="h-8 w-full sm:w-[200px]" />
					<Skeleton className="h-5 w-[160px]" />
				</div>
			</CardHeader>

			<CardContent>
				<div className="flex flex-row gap-2 sm:items-center sm:justify-between w-full mb-4">
					<div className="flex flex-1 items-center gap-2 flex-wrap">
						<Skeleton className="h-8 max-w-full sm:max-w-sm min-w-[150px] flex-1" />
						<Skeleton className="size-8" />
					</div>

					<Skeleton className="size-8 sm:w-[150px] ml-auto" />
				</div>

				{/* Table rows skeleton */}
				<div className="rounded-md border">
					<div className="relative">
						{/* Header row */}
						<div className="flex w-full p-4 gap-4">
							{Array(6)
								.fill(null)
								.map((_, i) => (
									<Skeleton
										key={i}
										className="h-4 flex-1"
									/>
								))}
						</div>

						{/* Data rows */}
						{Array(4)
							.fill(null)
							.map((_, i) => (
								<div
									key={i}
									className="flex w-full p-4 gap-4"
								>
									{Array(6)
										.fill(null)
										.map((_, j) => (
											<Skeleton
												key={j}
												className="h-10 flex-1"
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
