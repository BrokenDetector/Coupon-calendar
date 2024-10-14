import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { format, isSameDay, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { FC } from "react";

interface CouponModalProps {
	isModalOpen: boolean;
	selectedDate: Date | null;
	bondsForSelectedDate: Bond[];
	totalCouponsByCurrency: Record<string, number>;
	onClose: () => void;
}

const CouponModal: FC<CouponModalProps> = ({
	isModalOpen,
	selectedDate,
	bondsForSelectedDate,
	totalCouponsByCurrency,
	onClose,
}) => {
	return (
		<Dialog
			open={isModalOpen}
			onOpenChange={onClose}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Купоны на {selectedDate ? format(selectedDate, "d MMMM, yyyy", { locale: ru }) : ""}
					</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{bondsForSelectedDate.length > 0 ? (
						<div className="grid gap-2">
							{bondsForSelectedDate.map((bond, index) => {
								const couponIndex = bond.COUPONDATES!.findIndex((couponDate) =>
									isSameDay(parseISO(couponDate), selectedDate!)
								);
								const couponValue = bond.COUPONVALUE![couponIndex];
								const quantity = bond.quantity || 1;
								const currencySymbol = getCurrencySymbol(bond.CURRENCY || "RUB");

								return (
									<div
										key={index}
										className="flex justify-between"
									>
										<span>
											{bond.SHORTNAME} (x{quantity})
										</span>
										<span>
											{couponValue
												? `${(couponValue * quantity).toFixed(2)} ${currencySymbol}`
												: "-"}
										</span>
									</div>
								);
							})}
							<div className="flex justify-between font-bold">
								<span>Сумма купонов за день:</span>
								<div>
									{Object.entries(totalCouponsByCurrency).map(([currency, total]) => (
										<div key={currency}>
											{total.toFixed(2)} {getCurrencySymbol(currency)}
										</div>
									))}
								</div>
							</div>
						</div>
					) : (
						<p>Нет купонов в этот день.</p>
					)}
				</div>
				<DialogFooter>
					<Button onClick={onClose}>Закрыть</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CouponModal;
