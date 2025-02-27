"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface PortfolioLinkProps {
	portfolio: DBPortfolio;
	setSelectedPortfolioToEdit: (portfolio: DBPortfolio) => void;
	setIsEditDialogOpen: (isEditDialogOpen: boolean) => void;
	handleDeletePortfolio: (portfolioId: string) => void;
	onPortfolioSelect?: () => void;
}

const PortfolioLink = ({
	portfolio,
	setSelectedPortfolioToEdit,
	setIsEditDialogOpen,
	handleDeletePortfolio,
	onPortfolioSelect,
}: PortfolioLinkProps) => {
	return (
		<div className="flex items-center justify-between w-full group">
			<Link
				href={`/portfolio/${portfolio.id}`}
				className="flex items-center gap-2 flex-1"
				onClick={onPortfolioSelect}
			>
				<div
					className="size-3 rounded-full"
					style={{ backgroundColor: portfolio.color }}
				/>
				<FolderOpen className="size-4 mr-2" />
				{portfolio.name}
			</Link>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="size-8 p-0 hover:bg-muted"
					>
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						onClick={() => {
							setSelectedPortfolioToEdit(portfolio);
							setIsEditDialogOpen(true);
						}}
					>
						<Pencil className="mr-2 size-4" />
						Редактировать
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => handleDeletePortfolio(portfolio.id)}
					>
						<Trash2 className="mr-2 size-4" />
						Удалить
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default PortfolioLink;
