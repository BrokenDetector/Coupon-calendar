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
import toast from "react-hot-toast";
import ChangeThemeButton from "./ChangeThemeButton";

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
			toast.error(response.error);
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
	};

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
												className="hover:cursor-pointer size-full"
											>
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
										className="hover:cursor-pointer size-full"
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
					<div className="-mr-2 flex items-center sm:hidden">
						<Button
							variant="outline"
							className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary border-gray-300 shadow-sm"
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
				<div className="sm:hidden border-t border">
					<div className="pt-2 pb-3 space-y-1">
						<ChangeThemeButton />
						{user ? (
							<>
								{user.portfolios.map((port, index) => (
									<Button
										key={index}
										variant="ghost"
										asChild
										className="w-full justify-start"
										aria-label={`Портфель ${port.name}`}
									>
										<Link href={`/portfolio/${port.id}`}>{port.name}</Link>
									</Button>
								))}

								<Button
									variant="ghost"
									className="w-full justify-start text-red-600 hover:text-red-700"
									onClick={async () => await signOut()}
									aria-label="Выйти"
								>
									<LogOut className="size-5 mr-2" />
									Выйти
								</Button>
							</>
						) : (
							<>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									aria-label="Вход"
								>
									<Link href="/auth?view=login">
										<User className="size-5 mr-2" />
										Вход
									</Link>
								</Button>
								<Button
									variant="ghost"
									asChild
									className="w-full justify-start"
									aria-label="Регистрация"
								>
									<Link href="/auth?view=register">Регистрация</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
};

export default Header;
