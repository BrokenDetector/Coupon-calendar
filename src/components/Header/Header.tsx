"use client";

import { deletePortfolio } from "@/actions/portfolio-actions";
import { buttonVariants } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { customToast } from "../ui/toast/toast-variants";
import CreatePortfolioDialog from "./CreatePortfolioDialog";
import DesktopNav from "./DesktopNav";
import EditPortfolioDialog from "./EditPortfolioDialog";
import MobileNav from "./MobileNav";

const Header = () => {
	const { data: session, update } = useSession();
	const user = session?.user;
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
	const isPortfolioPage = pathname?.includes("/portfolio/") || false;

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedPortfolioToEdit, setSelectedPortfolioToEdit] = useState<DBPortfolio | null>(null);

	const handlePortfolioCreated = async (portfolioId: string, portfolioName: string) => {
		await update({
			...session,
			user: {
				...session?.user,
				portfolios: [...(session?.user?.portfolios || []), { id: portfolioId, name: portfolioName }],
			},
		});

		setLocalData(portfolioId);
		router.push(`/portfolio/${portfolioId}`);
	};

	const handleDeletePortfolio = async (portfolioId: string) => {
		try {
			const response = await deletePortfolio(portfolioId);
			if (!response.data) {
				throw new Error(response.error);
			}

			await update({
				...session,
				user: {
					...session?.user,
					portfolios: session?.user?.portfolios.filter((p) => p.id !== portfolioId) || [],
				},
			});

			if (portfolioId === portfolioIdFromUrl) {
				const remainingPortfolios = session?.user?.portfolios.filter((p) => p.id !== portfolioId);
				if (remainingPortfolios?.length) {
					router.push(`/portfolio/${remainingPortfolios[0].id}`);
				}
			}

			customToast.success("Портфель успешно удален");
		} catch (error) {
			customToast.error(error instanceof Error ? error.message : "Произошла ошибка при удалении портфеля");
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background mb-4">
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

					<DesktopNav
						selectedPortfolio={selectedPortfolio}
						isPortfolioPage={isPortfolioPage}
						setSelectedPortfolioToEdit={setSelectedPortfolioToEdit}
						setIsEditDialogOpen={setIsEditDialogOpen}
						handleDeletePortfolio={handleDeletePortfolio}
						setIsCreateDialogOpen={setIsCreateDialogOpen}
					/>
					<MobileNav
						selectedPortfolio={selectedPortfolio}
						isPortfolioPage={isPortfolioPage}
						setSelectedPortfolioToEdit={setSelectedPortfolioToEdit}
						setIsEditDialogOpen={setIsEditDialogOpen}
						handleDeletePortfolio={handleDeletePortfolio}
						setIsCreateDialogOpen={setIsCreateDialogOpen}
					/>
				</div>
			</div>

			<CreatePortfolioDialog
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onSuccess={handlePortfolioCreated}
			/>

			{selectedPortfolioToEdit && (
				<EditPortfolioDialog
					isOpen={isEditDialogOpen}
					onClose={() => {
						setIsEditDialogOpen(false);
						setSelectedPortfolioToEdit(null);
					}}
					onSuccess={async () => {
						await update();
					}}
					portfolio={selectedPortfolioToEdit}
				/>
			)}
		</header>
	);
};

export default Header;
