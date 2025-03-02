"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useTransition } from "react";

interface DeletePortfolioDialogProps {
	isOpen: boolean;
	onClose: () => void;
	handleDeletePortfolio: (portfolioId: string) => Promise<void>;
	portfolioId: string;
}

const DeletePortfolioDialog = ({ isOpen, onClose, handleDeletePortfolio, portfolioId }: DeletePortfolioDialogProps) => {
	const [isPending, startPending] = useTransition();
	const handleDelete = useCallback(async () => {
		startPending(async () => {
			await handleDeletePortfolio(portfolioId);
			onClose();
		});
	}, [handleDeletePortfolio, portfolioId, onClose]);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Удалить портфель</DialogTitle>
					<DialogDescription>Вы действительно хотите удалить портфель?</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={onClose}
						disabled={isPending}
					>
						Отмена
					</Button>
					<Button
						variant="destructive"
						type="button"
						disabled={isPending}
						onClick={handleDelete}
					>
						{isPending ? "Удаление..." : "Удалить"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeletePortfolioDialog;
