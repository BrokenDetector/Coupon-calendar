import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Loading() {
	return (
		<main className="min-h-screen flex items-center justify-center">
			<div className="container flex flex-col items-center justify-center">
				<Card className="w-[350px]">
					<CardHeader className="space-y-2">
						<Skeleton className="h-6 w-[140px]" />
						<Skeleton className="h-4 w-[250px]" />
					</CardHeader>
					<CardContent>
						{/* Tabs skeleton */}
						<div className="w-full mb-6">
							<Skeleton className="h-10 w-full rounded-lg" />
						</div>

						{/* Form fields skeleton */}
						<div className="space-y-6">
							<div className="space-y-4">
								{/* Input fields */}
								{[1, 2].map((i) => (
									<div
										key={i}
										className="space-y-2"
									>
										<Skeleton className="h-4 w-[60px]" />
										<Skeleton className="h-10 w-full" />
									</div>
								))}
							</div>

							{/* Button skeleton */}
							<Skeleton className="h-10 w-full" />
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
