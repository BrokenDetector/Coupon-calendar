import ChangeThemeButton from "@/components/ChangeThemeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

export default function Loading() {
	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[800px]">
			<header className="w-full border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<Link
								href="/"
								className="flex-shrink-0 flex items-center"
							>
								<Image
									className="size-14 dark:invert"
									src={"/logo.svg"}
									alt="logo"
									width={"56"}
									height={"56"}
								/>
								<div className="flex flex-col ml-2 text-xl font-bold">
									<span>Календарь</span>
									<span>купонов</span>
								</div>
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

			<div className="flex flex-col space-y-4 mx-10">
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
					{/* Summary Card Skeleton */}
					<Card className="col-span-4 xl:col-span-1 rounded-lg">
						<CardHeader>
							<CardTitle className="text-2xl font-bold">Общая информация по портфелю</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 flex flex-row xl:flex-col gap-3 justify-between items-baseline">
							<div>
								<p className="text-md font-semibold">Сумма инвестиций</p>
								<Skeleton className="h-6" />
							</div>
							<div>
								<p className="text-md font-semibold">Текущая стоимость портфеля</p>
								<Skeleton className="h-6" />
							</div>
							<div className="mt-4">
								<p className="text-md font-semibold">Результат</p>
								<Skeleton className="h-6" />
							</div>
							<div className="mt-4">
								<p className="text-md font-semibold">Средняя текущая доходность</p>
								<Skeleton className="h-6" />
							</div>
						</CardContent>
					</Card>

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
				</div>

				{/* Calendar Skeleton */}
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
			</div>
		</main>
	);
}
