"use client";

import { addOrUpdatePortfolio } from "@/actions/portfolio-actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { customToast } from "@/components/ui/toast/toast-variants";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";

const PRESET_COLORS = [
	{ name: "slate", value: "#94A3B8" },
	{ name: "red", value: "#F87171" },
	{ name: "orange", value: "#FB923C" },
	{ name: "green", value: "#4ADE80" },
	{ name: "blue", value: "#60A5FA" },
	{ name: "purple", value: "#C084FC" },
	{ name: "pink", value: "#F472B6" },
];

interface CreatePortfolioDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (portfolioId: string, portfolioName: string) => void;
}

const CreatePortfolioDialog = ({ isOpen, onClose, onSuccess }: CreatePortfolioDialogProps) => {
	const [name, setName] = useState("");
	const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
	const [isPending, startPending] = useTransition();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			return customToast.error("Введите название портфеля");
		}

		startPending(async () => {
			try {
				const response = await addOrUpdatePortfolio({ name: name.trim(), color: selectedColor });
				if (!response.data) {
					throw new Error(response.error);
				}
				onSuccess(response.data.newPortfolioId, response.data.portfolioName);
				customToast.success("Портфель успешно создан");
				handleClose();
			} catch (error) {
				customToast.error(error instanceof Error ? error.message : "Произошла ошибка");
			}
		});
	};

	const handleClose = () => {
		setName("");
		setSelectedColor(PRESET_COLORS[0].value);
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={handleClose}
		>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Создать новый портфель</DialogTitle>
						<DialogDescription>
							Введите название портфеля и выберите цвет для его отображения.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Input
								placeholder="Название портфеля"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="col-span-3"
							/>
						</div>
						<div className="grid gap-2">
							<label className="text-sm text-muted-foreground">Цвет портфеля</label>
							<div className="flex gap-2">
								{PRESET_COLORS.map((color) => (
									<button
										key={color.value}
										type="button"
										className={cn(
											"size-8 rounded-full transition-all",
											selectedColor === color.value
												? "ring-2 ring-offset-2 ring-primary"
												: "hover:ring-2 hover:ring-offset-2 hover:ring-primary/50"
										)}
										style={{ backgroundColor: color.value }}
										onClick={() => setSelectedColor(color.value)}
										aria-label={`Выбрать цвет ${color.name}`}
									/>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							type="button"
							onClick={handleClose}
							disabled={isPending}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							disabled={isPending}
						>
							{isPending ? "Создание..." : "Создать"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePortfolioDialog;
