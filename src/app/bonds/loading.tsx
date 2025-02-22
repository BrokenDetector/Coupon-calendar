import SkeletonHeader from "@/components/Skeletons/SkeletonHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[500px]">
			<SkeletonHeader />

			<div className="flex justify-center">
				<Card className="rounded-lg w-[600px] md:w-[800px] lg:w-[1000px] xl:w-[1200px]">
					<CardHeader>
						<CardTitle className="text-2xl font-bold">Все облигации</CardTitle>
					</CardHeader>
					<CardContent className="max-h-[700px]">
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
								{Array(8)
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
			</div>
		</main>
	);
}
