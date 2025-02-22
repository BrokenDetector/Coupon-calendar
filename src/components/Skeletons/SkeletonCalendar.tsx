import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCalendar = () => {
	return (
		<Card className="col-span-3 border rounded-lg bg-card/30 p-4">
			<div className="flex justify-between items-center mb-6">
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-9 w-9" />
			</div>

			<div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-2 mb-6">
				{Array(12)
					.fill(null)
					.map((_, i) => (
						<div
							key={i}
							className="flex flex-col gap-4 border rounded-lg items-center justify-between"
						>
							{/* Month header */}
							<Card className="w-full">
								<CardHeader className="p-2">
									<Skeleton className="h-5 w-32 mx-auto" />
								</CardHeader>
								<CardContent className="p-2">
									{/* Calendar grid */}
									<div className="grid grid-cols-7 gap-1 text-center">
										{/* Week days */}
										{Array(7)
											.fill(null)
											.map((_, i) => (
												<Skeleton
													key={i}
													className="h-4 w-full"
												/>
											))}
										{/* Calendar days */}
										{Array(35)
											.fill(null)
											.map((_, i) => (
												<Skeleton
													key={i}
													className="h-6 w-full"
												/>
											))}
									</div>
								</CardContent>
							</Card>
							<Skeleton className="h-4 w-32 mb-4" />
						</div>
					))}
			</div>
		</Card>
	);
};

export default SkeletonCalendar;
