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
import { useState } from "react";

interface PortfolioLinkProps {
	portfolio: DBPortfolio;
	setSelectedPortfolioToEdit: (portfolio: DBPortfolio) => void;
	setIsEditDialogOpen: (isEditDialogOpen: boolean) => void;
	onPortfolioSelect?: () => void;
	setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
	setPortfolioIdToDelete: (portfolioId: string) => void;
}

const PortfolioLink = ({
	portfolio,
	setSelectedPortfolioToEdit,
	setIsEditDialogOpen,
	setIsDeleteDialogOpen,
	setPortfolioIdToDelete,
	onPortfolioSelect,
}: PortfolioLinkProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleEdit = (e: React.MouseEvent) => {
		e.preventDefault();
		setSelectedPortfolioToEdit(portfolio);
		setIsEditDialogOpen(true);
		setIsOpen(false);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.preventDefault();
		setPortfolioIdToDelete(portfolio.id);
		setIsDeleteDialogOpen(true);
		setIsOpen(false);
	};

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
			<DropdownMenu
				open={isOpen}
				onOpenChange={setIsOpen}
			>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="size-8 p-0 hover:bg-muted"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleEdit}>
						<Pencil className="mr-2 size-4" />
						Редактировать
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={handleDelete}
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
