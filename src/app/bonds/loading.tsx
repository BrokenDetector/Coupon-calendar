import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<main className="min-h-screen min-w-[375px]">
			<div className="flex justify-center">
				<Card className="rounded-lg w-[340px] md:w-[800px] lg:w-[1000px] xl:w-[1200px]">
					<CardHeader>
						<CardTitle className="text-2xl font-bold">Все облигации</CardTitle>
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
							<div className="flex relative flex-col gap-4 p-4">
								{Array(12)
									.fill(null)
									.map((_, i) => (
										<Skeleton key={i} className="flex flex-1 gap-4 p-4 w-full h-10"></Skeleton>
									))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
