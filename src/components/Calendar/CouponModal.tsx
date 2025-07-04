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
						Выплаты на {selectedDate ? format(selectedDate, "d MMMM, yyyy", { locale: ru }) : ""}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					{bondsForSelectedDate.length > 0 ? (
						<>
							{bondsForSelectedDate.map((bond) => {
								const couponIndex =
									bond.COUPONDATES?.findIndex((date) => isSameDay(parseISO(date), selectedDate!)) ??
									-1;

								const amortizationIndex =
									bond.AMORTIZATIONDATES?.findIndex((date) =>
										isSameDay(parseISO(date), selectedDate!)
									) ?? -1;

								const hasCoupon = couponIndex !== -1;
								const hasAmortization = amortizationIndex !== -1;

								return (
									<div
										key={bond.SECID}
										className="flex flex-row justify-between items-center p-4 rounded-lg border"
									>
										<div>
											<h3 className="font-bold">{bond.SHORTNAME}</h3>
											{hasCoupon && (
												<div className="flex flex-row gap-2 items-center text-sm">
													Купон:
													{bond.COUPONVALUES?.[couponIndex] ? (
														<div>
															{bond.COUPONVALUES?.[couponIndex].toFixed(2)}{" "}
															{getCurrencySymbol(bond.FACEUNIT)}
														</div>
													) : (
														<span>Не определён</span>
													)}
												</div>
											)}
											{hasAmortization && (
												<div className="text-sm">
													Амортизация:{" "}
													{bond.AMORTIZATIONVALUES?.[amortizationIndex].value.toFixed(2)}
													{getCurrencySymbol(bond.FACEUNIT)}{" "}
													<span className="text-muted-foreground">
														{`(${bond.AMORTIZATIONVALUES?.[
															amortizationIndex
														].percent.toFixed(2)}%)`}
													</span>
												</div>
											)}
										</div>
										<span>x{bond.quantity}</span>
									</div>
								);
							})}
							<div className="font-bold">
								Итого:
								{Object.entries(totalCouponsByCurrency).map(([currency, total]) => (
									<div key={currency}>
										{total.toFixed(2)} {getCurrencySymbol(currency)}
									</div>
								))}
							</div>
						</>
					) : (
						<p>Нет выплат на этот день</p>
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
