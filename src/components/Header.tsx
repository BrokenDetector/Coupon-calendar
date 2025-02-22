"use client";

import { addPortfolio } from "@/actions/add-portfolio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { ChevronDown, FolderOpen, LogOut, Menu, Plus, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChangeThemeButton from "./ChangeThemeButton";
import { customToast } from "./ui/toast/toast-variants";

const Header = () => {
	const { data: session, update } = useSession();
	const user = session?.user;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const portfoliosCount = (user?.portfolios?.length || 0) < 5;
	const router = useRouter();
	const pathname = usePathname();

	const { getLocalData, setLocalData } = useLocalStorage("SELECTED_PORTFOLIO_ID");

	const portfolioIdFromUrl = pathname?.split("/portfolio/")[1];
	const portfolioIdFromStorage = getLocalData();
	const portfolioId = portfolioIdFromUrl || portfolioIdFromStorage;

	useEffect(() => {
		if (portfolioIdFromUrl) {
			setLocalData(portfolioIdFromUrl);
		}
	}, [portfolioIdFromUrl, setLocalData]);

	const selectedPortfolio = user?.portfolios?.find((p) => p.id === portfolioId);
	const isPortfolioPage = pathname?.includes("/portfolio/");

	const handleAddPortfolio = async () => {
		const response = await addPortfolio();

		if (!response.data) {
			customToast.error(response.error);
			return;
		}

		await update({
			...session,
			user: {
				...session?.user,
				portfolios: [
					...(session?.user?.portfolios || []),
					{ id: response.data.newPortfolioId, name: response.data.portfolioName },
				],
			},
		});

		setLocalData(response.data.newPortfolioId);
		router.push(`/portfolio/${response.data.newPortfolioId}`);
		customToast.success("Портфель успешно создан");
	};

	// Add useEffect to handle body scroll
	useEffect(() => {
		if (isMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isMenuOpen]);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
				<div className="flex flex-1 items-center justify-between">
					<div className="flex items-center gap-2">
						<Link
							href="/"
							className={cn(
								buttonVariants({ variant: "ghost" }),
								"flex items-center gap-2 hover:bg-transparent"
							)}
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
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										asChild
										aria-label="Профиль"
									>
										<div className="flex items-center space-x-2 h-fit py-1">
											<Avatar className="size-8">
												<AvatarImage
													src={user!.image || "/placeholder-user.jpg"}
													alt={user!.name}
												/>
												<AvatarFallback>{user!.name.slice(0, 2).toUpperCase()}</AvatarFallback>
											</Avatar>
											<div className="flex items-center gap-2">
												<span>{user!.name}</span>
												{selectedPortfolio && isPortfolioPage && (
													<>
														<span className="text-muted-foreground">/</span>
														<span className="flex items-center gap-1 text-muted-foreground">
															<FolderOpen className="size-4" />
															{selectedPortfolio.name}
														</span>
													</>
												)}
												<ChevronDown className="size-4 text-gray-500" />
											</div>
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56"
								>
									{user.portfolios.map((port, index) => (
										<DropdownMenuItem
											key={index}
											aria-label={`Портфель ${port.name}`}
										>
											<Link
												href={`/portfolio/${port.id}`}
												className="hover:cursor-pointer size-full flex items-center gap-2"
											>
												<FolderOpen className="size-4" />
												{port.name}
											</Link>
										</DropdownMenuItem>
									))}
									{portfoliosCount && (
										<DropdownMenuItem
											className="hover:cursor-pointer size-full"
											onClick={handleAddPortfolio}
											aria-label="Новый портфель"
										>
											<Plus className="size-4 mr-2" />
											<span>Новый портфель</span>
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={async () => await signOut()}
										className="hover:cursor-pointer size-full text-red-600 hover:text-red-700"
										aria-label="Выйти"
									>
										<LogOut className="mr-2 size-4" />
										<span>Выйти</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<>
								<Button
									variant="outline"
									asChild
									className="border shadow-sm"
									aria-label="Вход"
								>
									<Link href="/auth?view=login">
										<User className="size-5 mr-2" />
										Вход
									</Link>
								</Button>
								<Button
									variant="default"
									asChild
									className="ml-4 shadow-sm"
									aria-label="Регистрация"
								>
									<Link href="/auth?view=register">Регистрация</Link>
								</Button>
							</>
						)}
					</div>
					<div className="-mr-2 flex items-center gap-2 sm:hidden">
						<ChangeThemeButton />

						<Button
							variant="outline"
							className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary border shadow-sm"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label="Меню"
						>
							{isMenuOpen ? (
								<X
									className="block size-6"
									aria-hidden="true"
								/>
							) : (
								<Menu
									className="block size-6"
									aria-hidden="true"
								/>
							)}
						</Button>
					</div>
				</div>
			</div>
			{isMenuOpen && (
				<div
					className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 sm:hidden"
					onClick={() => setIsMenuOpen(false)}
				/>
			)}

			<div
				className={cn(
					"fixed top-0 right-0 z-50 h-full w-2/3 max-w-sm bg-background border-l transform transition-transform duration-200 ease-in-out sm:hidden",
					isMenuOpen ? "translate-x-0" : "translate-x-full"
				)}
			>
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-between p-4 border-b">
						<span className="font-semibold">Меню</span>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMenuOpen(false)}
							className="shrink-0"
							aria-label="Закрыть меню"
						>
							<X className="size-5" />
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto">
						<div className="p-4 space-y-4">
							{user ? (
								<div className="flex flex-col gap-4">
									<div className="flex items-center space-x-3">
										<Avatar className="size-9">
											<AvatarImage
												src={user.image || "/placeholder-user.jpg"}
												alt={user.name}
											/>
											<AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="font-medium">{user.name}</span>
											{selectedPortfolio && isPortfolioPage && (
												<span className="flex items-center gap-1 text-sm text-muted-foreground">
													<FolderOpen className="size-4" />
													{selectedPortfolio.name}
												</span>
											)}
										</div>
									</div>

									<div className="border-t pt-4">
										{user.portfolios.map((port, index) => (
											<Button
												key={index}
												variant="ghost"
												asChild
												className="w-full justify-start"
												onClick={() => setIsMenuOpen(false)}
											>
												<Link href={`/portfolio/${port.id}`}>
													<FolderOpen className="size-4 mr-2" />
													{port.name}
												</Link>
											</Button>
										))}

										{portfoliosCount && (
											<Button
												variant="ghost"
												className="w-full justify-start"
												onClick={() => {
													handleAddPortfolio();
													setIsMenuOpen(false);
												}}
											>
												<Plus className="size-4 mr-2" />
												Новый портфель
											</Button>
										)}
									</div>
								</div>
							) : (
								<div className="flex flex-col gap-2">
									<Button
										variant="outline"
										asChild
										className="border shadow-sm"
										aria-label="Вход"
									>
										<Link href="/auth?view=login">
											<User className="size-5 mr-2" />
											Вход
										</Link>
									</Button>
									<Button
										variant="default"
										asChild
										className="shadow-sm"
										aria-label="Регистрация"
									>
										<Link href="/auth?view=register">Регистрация</Link>
									</Button>
								</div>
							)}
						</div>
					</div>

					<div className="border-t p-4 ">
						{user && (
							<Button
								variant="ghost"
								className="w-full justify-start text-destructive hover:text-destructive/90"
								onClick={async () => {
									await signOut();
									setIsMenuOpen(false);
								}}
							>
								<LogOut className="size-4 mr-2" />
								Выйти
							</Button>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
