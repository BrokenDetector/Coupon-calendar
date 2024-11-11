"use client";

import { useBonds } from "@/context/BondContext";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { Trash } from "lucide-react";
import { FC, memo, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";

interface BondRowProps {
	bond: Bond;
	handleQuantityBlur: (bond: Bond) => void;
	handlePriceBlur: (secid: string, newPrice: string) => void;
	removeBond: (SECID: string) => void;
}

const BondRow: FC<BondRowProps> = memo(
	({ bond, handlePriceBlur, removeBond, handleQuantityBlur }) => {
		const { setBonds } = useBonds();

		const getCurrentYield = (): string => {
			const nominalValue = bond.FACEVALUE || 0;
			const currentPrice = bond.LAST || bond.PREVWAPRICE || nominalValue;
			const couponFrequency = bond.COUPONFREQUENCY || 365;
			const annualCouponPayment = (bond.COUPONVALUE || 0) * (365 / couponFrequency);

			if (currentPrice > 0) {
				const currentYield = (annualCouponPayment / ((currentPrice / 100) * nominalValue)) * 100;
				return `${currentYield.toFixed(2)} %`;
			}
			return "Н/Д";
		};

		const getCurrentPrice = (): number => {
			return bond.LAST ?? bond.PREVWAPRICE ?? bond.FACEVALUE ?? 0;
		};

		const handleQuantityChange = (value: number) => {
			if (!isNaN(value) && value > 0) {
				setBonds((prev) => prev.map((b) => (b.SECID === bond.SECID ? { ...b, quantity: value } : b)));
			}
		};

		const handlePriceChange = useCallback(
			(price: string) => {
				setBonds((prevBonds) =>
					prevBonds.map((b) => (bond.SECID === b.SECID ? { ...b, purchasePrice: price } : b))
				);
			},
			[bond.SECID, setBonds]
		);

		return (
			<TableRow className="text-center whitespace-nowrap">
				<TableCell className="flex flex-col">
					<span className="font-bold text-left">{bond.SHORTNAME}</span>
					<span className="text-xs text-muted-foreground">{bond.ISIN}</span>
				</TableCell>
				<TableCell>{`${bond.FACEVALUE} ${getCurrencySymbol(bond.FACEUNIT)}`}</TableCell>
				<TableCell>
					<Input
						type="number"
						placeholder="Введите %"
						value={bond.purchasePrice || 100}
						onChange={(e) => handlePriceChange(e.target.value)}
						onBlur={(e) => handlePriceBlur(bond.SECID, e.target.value === "" ? "100" : e.target.value)}
						aria-label={`${bond.SHORTNAME} price`}
					/>
				</TableCell>
				<TableCell>{getCurrentPrice().toFixed(2)}%</TableCell>
				<TableCell>{bond.COUPONFREQUENCY}</TableCell>
				<TableCell>
					{bond.COUPONVALUE ? `${bond.COUPONVALUE} ${getCurrencySymbol(bond.FACEUNIT)}` : "Н/Д"}
				</TableCell>
				<TableCell>{getCurrentYield()}</TableCell>
				<TableCell>{bond.EFFECTIVEYIELD ? `${bond.EFFECTIVEYIELD.toFixed(2)} %` : "Н/Д"}</TableCell>
				<TableCell>{bond.DURATION || "Н/Д"}</TableCell>
				<TableCell>{`${bond.ACCRUEDINT?.toFixed(2)} ${getCurrencySymbol("RUB")}`}</TableCell>
				<TableCell>{bond.NEXTCOUPON}</TableCell>
				<TableCell>{bond.MATDATE}</TableCell>
				<TableCell>
					<Input
						type="number"
						value={bond.quantity}
						onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
						onBlur={() => handleQuantityBlur(bond)}
						onKeyDown={(e) => {
							if (e.keyCode === 13) {
								handleQuantityBlur(bond);
							}
						}}
						className="border p-1 rounded-md text-center max-w-28 overflow-hidden text-ellipsis"
						aria-label={`${bond.SHORTNAME} quantity`}
					/>
				</TableCell>
				<TableCell>
					<Button
						onClick={() => removeBond(bond.SECID)}
						size={"icon"}
						variant={"ghost"}
						className="text-destructive hover:text-destructive/90 rounded-lg h-fit"
						aria-label={`Remove ${bond.SHORTNAME}`}
					>
						<Trash className="size-4" />
					</Button>
				</TableCell>
			</TableRow>
		);
	},
	(prevProps, nextProps) => prevProps.bond === nextProps.bond
);

BondRow.displayName = "BondRow";
export default BondRow;
