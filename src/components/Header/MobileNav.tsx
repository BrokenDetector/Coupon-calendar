"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FolderOpen, LogOut, Menu, Plus, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChangeThemeButton from "./ChangeThemeButton";
import PortfolioLink from "./PortfolioLink";

interface MobileNavProps {
	selectedPortfolio: DBPortfolio;
	isPortfolioPage: boolean;
	setSelectedPortfolioToEdit: (portfolio: DBPortfolio) => void;
	setIsEditDialogOpen: (isEditDialogOpen: boolean) => void;
	handleDeletePortfolio: (portfolioId: string) => void;
	setIsCreateDialogOpen: (isCreateDialogOpen: boolean) => void;
}

const MobileNav = ({
	selectedPortfolio,
	isPortfolioPage,
	setSelectedPortfolioToEdit,
	setIsEditDialogOpen,
	handleDeletePortfolio,
	setIsCreateDialogOpen,
}: MobileNavProps) => {
	const { data: session } = useSession();
	const user = session?.user;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const portfoliosCount = (user?.portfolios?.length || 0) < 5;
	const router = useRouter();

	return (
		<>
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
											<PortfolioLink
												key={index}
												portfolio={port}
												setSelectedPortfolioToEdit={setSelectedPortfolioToEdit}
												setIsEditDialogOpen={setIsEditDialogOpen}
												handleDeletePortfolio={handleDeletePortfolio}
											/>
										))}

										{portfoliosCount && (
											<Button
												variant="ghost"
												className="w-full justify-start"
												onClick={() => setIsCreateDialogOpen(true)}
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
										onClick={() => {
											router.push("/auth?view=login");
											setIsMenuOpen(false);
										}}
										className="border shadow-sm"
										aria-label="Вход"
									>
										<User className="size-5 mr-2" />
										Вход
									</Button>
									<Button
										variant="default"
										onClick={() => {
											router.push("/auth?view=register");
											setIsMenuOpen(false);
										}}
										className="shadow-sm"
										aria-label="Регистрация"
									>
										Регистрация
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
		</>
	);
};

export default MobileNav;
