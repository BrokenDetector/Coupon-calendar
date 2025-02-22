import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonDataTable = () => {
	return (
		<Card className="col-span-4 xl:col-span-3 rounded-lg">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-2xl font-bold">Мои облигации</CardTitle>
				<div className="flex flex-col space-y-2 items-left justify-center">
					<Skeleton className="h-4 w-32 ml-4" />
					<Skeleton className="h-9 w-full max-w-80" />
				</div>
			</CardHeader>
			<CardContent className="max-h-[400px]">
				<div className="flex flex-row w-full items-center justify-between py-4">
					<Skeleton className="h-6 w-36" />
					<Skeleton className="h-6 w-28" />
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
