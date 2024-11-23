import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

interface ExtendedBond extends Bond {
	handleQuantityBlur: (bond: Bond) => void;
	handlePriceBlur: (secid: string, newPrice: string) => void;
	removeBond: (SECID: string) => void;
	handleQuantityChange: (secId: string, value: number) => void;
	handlePriceChange: (secId: string, price: string) => void;
}

const getCurrentYield = (bond: Bond): number => {
	const nominalValue = bond.FACEVALUE || 0;
	const currentPrice = bond.LAST || bond.PREVWAPRICE || nominalValue;
	const couponFrequency = bond.COUPONFREQUENCY || 365;
	const annualCouponPayment = (bond.COUPONVALUE || 0) * (365 / couponFrequency);

	if (currentPrice > 0) {
		const currentYield = (annualCouponPayment / ((currentPrice / 100) * nominalValue)) * 100;
		return parseFloat(currentYield.toFixed(2));
	}
	return 0;
};

const getCurrentPrice = (bond: Bond): number => {
	return bond.LAST ?? bond.PREVWAPRICE ?? 0;
};

export const columns: ColumnDef<ExtendedBond>[] = [
	{
		accessorKey: "SHORTNAME",
		header: "Облигация",
		cell: ({ row }) => (
			<div className="flex flex-col text-left">
				<span className="font-bold">{row.original.SHORTNAME}</span>
				<span className="text-sm text-muted-foreground">{row.original.ISIN}</span>
			</div>
		),
		filterFn: (row, columnId, filterValue) => {
			const { SHORTNAME, ISIN } = row.original;
			return (
				SHORTNAME.toLowerCase().includes(filterValue.toLowerCase()) ||
				ISIN.toLowerCase().includes(filterValue.toLowerCase())
			);
		},
	},
	{
		accessorKey: "FACEVALUE",
		header: "Номинал",
		cell: ({ row }) => `${row.original.FACEVALUE} ${getCurrencySymbol(row.original.FACEUNIT)}`,
	},
	{
		accessorKey: "PURCHASEPRICE",
		header: ({ column }) => {
			return (
				<div className="flex flex-col whitespace-nowrap	">
					<span>Цена</span>
					<span>покупки (%)</span>
				</div>
			);
		},
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Input
					type="number"
					placeholder="Введите %"
					value={bond.purchasePrice || 100}
					onBlur={(e) => bond.handlePriceChange(bond.SECID, e.target.value === "" ? "100" : e.target.value)}
					aria-label={`${bond.SHORTNAME} price`}
					onChange={(e) => bond.handlePriceChange(bond.SECID, e.target.value)}
					className="w-24"
				/>
			);
		},
		sortingFn: (rowA, rowB) => {
			const priceA = parseFloat(rowA.original.purchasePrice || "100");
			const priceB = parseFloat(rowB.original.purchasePrice || "100");
			return priceA - priceB;
		},
	},
	{
		accessorKey: "CURRENTPRICE",
		header: "Текущая стоимость",
		cell: ({ row }) => `${getCurrentPrice(row.original).toFixed(2)}%`,
		sortingFn: (rowA, rowB) => {
			const currPriceA = getCurrentPrice(rowA.original);
			const currPriceB = getCurrentPrice(rowB.original);
			return currPriceA - currPriceB;
		},
	},
	{
		accessorKey: "COUPONVALUE",
		header: "Купон",
		cell: ({ row }) => {
			const bond = row.original;
			return bond.COUPONVALUE ? `${bond.COUPONVALUE} ${getCurrencySymbol(bond.FACEUNIT)}` : "Н/Д";
		},
	},
	{
		accessorKey: "CURRENTYIELD",
		header: "Текущая доходность",
		cell: ({ row }) => `${getCurrentYield(row.original)} %`,
		sortingFn: (rowA, rowB) => {
			const currYieldA = getCurrentYield(rowA.original);
			const currYieldB = getCurrentYield(rowB.original);
			return currYieldA - currYieldB;
		},
	},
	{
		accessorKey: "YTM",
		header: "YTM",
		cell: ({ row }) => {
			const bond = row.original;
			return bond.EFFECTIVEYIELD ? `${bond.EFFECTIVEYIELD.toFixed(2)} %` : "Н/Д";
		},

		sortingFn: (rowA, rowB) => {
			const YTMA = rowA.original.EFFECTIVEYIELD || 0;
			const YTMB = rowB.original.EFFECTIVEYIELD || 0;
			return YTMA - YTMB;
		},
	},
	{
		accessorKey: "DURATION",
		header: "Дюрация (в днях)",
		cell: ({ row }) => row.original.DURATION || "Н/Д",
	},
	{
		accessorKey: "ACCUREDINT",
		header: "НКД",
		cell: ({ row }) => `${row.original.ACCRUEDINT?.toFixed(2)} ${getCurrencySymbol("RUB")}`,
		sortingFn: (rowA, rowB) => {
			const accruedIntA = rowA.original.ACCRUEDINT || 0;
			const accruedIntB = rowB.original.ACCRUEDINT || 0;
			return accruedIntA - accruedIntB;
		},
	},
	{
		accessorKey: "NEXTCOUPON",
		header: "Следующий купон",
		cell: ({ row }) => row.original.NEXTCOUPON,
	},
	{
		accessorKey: "MATDATE",
		header: "Погашение",
		cell: ({ row }) => row.original.MATDATE,
	},
	{
		accessorKey: "QUANTITY",
		header: "Кол-во",
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Input
					type="number"
					value={bond.quantity}
					onChange={(e) => bond.handleQuantityChange(bond.SECID, parseInt(e.target.value))}
					onBlur={() => bond.handleQuantityBlur(bond)}
					onKeyDown={(e) => {
						if (e.keyCode === 13) {
							bond.handleQuantityBlur(bond);
						}
					}}
					className="w-16"
					aria-label={`${bond.SHORTNAME} quantity`}
				/>
			);
		},
		sortingFn: (rowA, rowB) => {
			const quantityA = rowA.original.quantity || 0;
			const quantityB = rowB.original.quantity || 0;
			return quantityA - quantityB;
		},
	},
	{
		id: "ACTIONS",
		header: "Действие",
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Button
					onClick={() => bond.removeBond(bond.SECID)}
					variant={"ghost"}
					className="text-destructive hover:text-destructive/90 rounded-lg h-fit"
					aria-label={`Remove ${bond.SHORTNAME}`}
				>
					<Trash className="size-4" />
				</Button>
			);
		},
		enableSorting: false,
	},
];
