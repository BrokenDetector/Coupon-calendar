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
import { ChevronDown, FolderOpen, LogOut, Plus, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChangeThemeButton from "./ChangeThemeButton";
import PortfolioLink from "./PortfolioLink";

interface DesktopNavProps {
	selectedPortfolio: DBPortfolio;
	isPortfolioPage: boolean;
	setSelectedPortfolioToEdit: (portfolio: DBPortfolio) => void;
	setIsEditDialogOpen: (isEditDialogOpen: boolean) => void;
	setIsCreateDialogOpen: (isCreateDialogOpen: boolean) => void;
	setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
	setPortfolioIdToDelete: (portfolioId: string) => void;
}

const DesktopNav = ({
	selectedPortfolio,
	isPortfolioPage,
	setSelectedPortfolioToEdit,
	setIsEditDialogOpen,
	setIsCreateDialogOpen,
	setIsDeleteDialogOpen,
	setPortfolioIdToDelete,
}: DesktopNavProps) => {
	const { data: session } = useSession();
	const userSession = session?.user;
	const portfoliosCountSession = (userSession?.portfolios?.length || 0) < 5;
	const router = useRouter();

	return (
		<div className="hidden space-x-2 sm:ml-6 sm:flex sm:items-center">
			<ChangeThemeButton />
			{userSession ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							asChild
							aria-label="Профиль"
						>
							<div className="flex items-center py-1 space-x-2 h-fit">
								<Avatar className="size-8">
									<AvatarImage
										src={userSession!.image || "/placeholder-user.jpg"}
										alt={userSession!.name}
									/>
									<AvatarFallback>{userSession!.name.slice(0, 2).toUpperCase()}</AvatarFallback>
								</Avatar>
								<div className="flex gap-2 items-center">
									<span>{userSession!.name}</span>
									{selectedPortfolio && isPortfolioPage && (
										<>
											<span className="text-muted-foreground">/</span>
											<span className="flex gap-1 items-center text-muted-foreground">
												<FolderOpen className="size-4" />
												{selectedPortfolio.name}
											</span>
										</>
									)}
									<ChevronDown className="text-gray-500 size-4" />
								</div>
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56"
					>
						{userSession.portfolios.map((port, index) => (
							<DropdownMenuItem
								key={index}
								aria-label={`Портфель ${port.name}`}
							>
								<PortfolioLink
									portfolio={port}
									setSelectedPortfolioToEdit={setSelectedPortfolioToEdit}
									setIsEditDialogOpen={setIsEditDialogOpen}
									setIsDeleteDialogOpen={setIsDeleteDialogOpen}
									setPortfolioIdToDelete={setPortfolioIdToDelete}
								/>
							</DropdownMenuItem>
						))}
						{portfoliosCountSession && (
							<DropdownMenuItem
								className="hover:cursor-pointer size-full"
								onClick={() => setIsCreateDialogOpen(true)}
								aria-label="Новый портфель"
							>
								<Plus className="mr-2 size-4" />
								<span>Новый портфель</span>
							</DropdownMenuItem>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={async () => await signOut()}
							className="text-red-600 hover:cursor-pointer size-full hover:text-red-700"
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
						onClick={() => router.push("/auth?view=login")}
						className="border shadow-xs"
						aria-label="Вход"
					>
						<User className="mr-2 size-5" />
						Вход
					</Button>
					<Button
						variant="default"
						onClick={() => router.push("/auth?view=register")}
						className="ml-4 shadow-xs"
						aria-label="Регистрация"
					>
						Регистрация
					</Button>
				</>
			)}
		</div>
	);
};

export default DesktopNav;
