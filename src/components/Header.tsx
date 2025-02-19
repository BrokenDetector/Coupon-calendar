"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Menu, Plus, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ChangeThemeButton from "./ChangeThemeButton";

const Header = () => {
	const { data: session, update } = useSession();
	const user = session?.user;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const portfoliosCount = (user?.portfolios?.length || 0) < 5;
	const router = useRouter();

	const handleAddPortfolio = async () => {
		const response = await fetch("/api/add-portfolio", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			toast.error(error.error);
			return;
		}

		const data = await response.json();

		await update({
			...session,
			user: {
				...session?.user,
				portfolios: [
					...(session?.user?.portfolios || []),
					{ id: data.newPortfolioId, name: data.portfolioName },
				],
			},
		});

		router.push(`/portfolio/${data.newPortfolioId}`);
	};

	return (
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
								alt="Календарь купонов"
								width={56}
								height={56}
								priority
							/>
							<div className="flex flex-col ml-2 text-xl font-bold">
								<span>Календарь</span>
								<span>купонов</span>
							</div>
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
											<span>{user!.name}</span>
											<ChevronDown className="size-4 text-gray-500" />
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
