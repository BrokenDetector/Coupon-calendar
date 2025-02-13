import ChangeThemeButton from "@/components/ChangeThemeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

export default function Loading() {
	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[700px]">
			<header className="sticky top-0 z-50 w-full border-b bg-background">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
					<div className="flex flex-1 items-center justify-between">
						<div className="flex items-center gap-2">
							<Link
								href="/"
								className="flex items-center gap-2 hover:bg-transparent"
							>
								<Image
									src="/logo.svg"
									width={32}
									height={32}
									alt="Logo"
									className="dark:invert"
								/>
								<span className="hidden sm:inline-block font-bold">Купоны Облигаций</span>
							</Link>
						</div>

						<div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
							<ChangeThemeButton />
							<Skeleton className="h-10 w-[200px]" />
						</div>
						<div className="-mr-2 flex items-center sm:hidden">
							<Skeleton className="h-10 w-10" />
						</div>
					</div>
				</div>
			</header>

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
