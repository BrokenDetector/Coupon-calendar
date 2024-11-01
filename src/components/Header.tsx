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
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import ChangeThemeButton from "./ChangeThemeButton";

interface HeaderProps {
	user: User | null;
}

const Header: FC<HeaderProps> = ({ user }) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const portfoliosCount = user?.portfolios.length! < 5;
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

		const newPortId = (await response.json()).newPortfolioId;
		router.push(`/portfolio/${newPortId}`);
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
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex items-center space-x-2"
									>
										<Avatar className="size-8">
											<AvatarImage
												src="/placeholder-user.jpg"
												alt={user!.name}
											/>
											<AvatarFallback>{user!.name.slice(0, 2).toUpperCase()}</AvatarFallback>
										</Avatar>
										<span>{user!.name}</span>
										<ChevronDown className="size-4 text-gray-500" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56"
								>
									{user.portfolios.map((port, index) => (
										<DropdownMenuItem key={index}>
											<Link href={`/portfolio/${port.id}`}>{port.name}</Link>
										</DropdownMenuItem>
									))}
									{portfoliosCount && (
										<DropdownMenuItem
											className="hover:cursor-pointer"
											onClick={handleAddPortfolio}
										>
											<Plus className="size-4 mr-2" />
											<span>Новый портфель</span>
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={async () => await signOut()}
										className="hover:cursor-pointer"
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
									>
										<Link href={`/portfolio/${port.id}`}>{port.name}</Link>
									</Button>
								))}

								<Button
									variant="ghost"
									className="w-full justify-start text-red-600 hover:text-red-700"
									onClick={async () => await signOut()}
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
