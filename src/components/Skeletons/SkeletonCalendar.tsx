import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCalendar = () => {
	return (
		<Card className="col-span-3 p-4 rounded-lg border bg-card/30">
			<div className="flex justify-between items-center mb-6">
				<Skeleton className="w-9 h-9" />
				<Skeleton className="w-40 h-8" />
				<Skeleton className="w-9 h-9" />
			</div>

			<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 mb-6">
				{Array(12)
					.fill(null)
					.map((_, i) => (
						<div
							key={i}
							className="flex flex-col gap-4 justify-between items-center rounded-lg border"
						>
							{/* Month header */}
							<Card className="w-full">
								<CardHeader className="p-2">
									<Skeleton className="mx-auto w-32 h-5" />
								</CardHeader>
								<CardContent className="p-2">
									{/* Calendar grid */}
									<Skeleton className="w-full h-48" />
								</CardContent>
							</Card>
							<Skeleton className="mb-4 w-32 h-4" />
						</div>
					))}
			</div>
		</Card>
	);
};

export default SkeletonCalendar;
