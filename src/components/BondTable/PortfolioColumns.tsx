import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ExtendedBond extends Bond {
	handleQuantityBlur: (bond: Bond) => void;
	handlePriceBlur: (bond: Bond, newPrice: number) => void;
	removeBond: (SECID: string) => void;
	handleQuantityChange: (secId: string, value: number) => void;
	handlePriceChange: (secId: string, price: number) => void;
}

export const columns: ColumnDef<ExtendedBond>[] = [
	{
		accessorKey: "SHORTNAME",
		header: "Облигация",
		cell: ({ row }) => (
			<div className="flex flex-col text-left ml-2">
				<span className="font-bold text-sm">{row.original.SHORTNAME}</span>
				<span className="text-xs text-muted-foreground">{row.original.ISIN}</span>
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
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Номинал</TooltipTrigger>
					<TooltipContent>
						<p>Номинальная стоимость облигации при выпуске</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => `${row.original.FACEVALUE} ${getCurrencySymbol(row.original.FACEUNIT)}`,
	},
	{
		accessorKey: "PURCHASEPRICE",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<div className="flex flex-col whitespace-nowrap">
							<span>Цена</span>
							<span>покупки (%)</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>Цена покупки облигации в процентах от номинала</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Input
					type="number"
					placeholder="Введите %"
					value={bond.purchasePrice}
					onBlur={(e) => {
						// If input is empty, reset to 100 and update both state and server
						const newValue = e.target.value === "" ? 100 : parseFloat(e.target.value);
						bond.handlePriceChange(bond.SECID, newValue);
						bond.handlePriceBlur(bond, newValue);
					}}
					aria-label={`Цена покупки ${bond.SHORTNAME}`}
					onChange={(e) => bond.handlePriceChange(bond.SECID, parseFloat(e.target.value))}
					className="w-20"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							bond.handlePriceBlur(bond, bond.purchasePrice!);
							(e.target as HTMLElement).blur();
						}
					}}
				/>
			);
		},
		sortingFn: (rowA, rowB) => {
			const priceA = rowA.original.purchasePrice || 100;
			const priceB = rowB.original.purchasePrice || 100;
			return priceA - priceB;
		},
	},
	{
		accessorKey: "CURRENTPRICE",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Текущая стоимость</TooltipTrigger>
					<TooltipContent>
						<p>Текущая рыночная цена в процентах от номинала</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => `${row.original.CURRENTPRICE!.toFixed(2)}%`,
		sortingFn: (rowA, rowB) => {
			const currPriceA = rowA.original.CURRENTPRICE!;
			const currPriceB = rowB.original.CURRENTPRICE!;
			return currPriceA - currPriceB;
		},
	},
	{
		accessorKey: "COUPONVALUE",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Купон</TooltipTrigger>
					<TooltipContent>
						<p>Сумма купонной выплаты за один период</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => {
			const bond = row.original;
			return bond.COUPONVALUE ? `${bond.COUPONVALUE} ${getCurrencySymbol(bond.FACEUNIT)}` : "Н/Д";
		},
	},
	{
		accessorKey: "CURRENTYIELD",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Текущая доходность</TooltipTrigger>
					<TooltipContent>
						<p>Годовой купонный доход / Текущая цена × 100%</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => `${row.original.CURRENTYIELD} %`,
		sortingFn: (rowA, rowB) => {
			const currYieldA = rowA.original.CURRENTYIELD!;
			const currYieldB = rowB.original.CURRENTYIELD!;
			return currYieldA - currYieldB;
		},
	},
	{
		accessorKey: "YTM",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>YTM</TooltipTrigger>
					<TooltipContent>
						<p>Доходность к погашению с учетом всех выплат и текущей цены</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
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
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Дюрация</TooltipTrigger>
					<TooltipContent>
						<p>
							Период времени, через который нам вернется инвестируемая сумма. Облигации с более длинной
							дюрацией более волатильны. Измеряется в днях,
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => row.original.DURATION || "Н/Д",
	},
	{
		accessorKey: "ACCUREDINT",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>НКД</TooltipTrigger>
					<TooltipContent>
						<p>Накопленный купонный доход</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => `${row.original.ACCRUEDINT?.toFixed(2)} ${getCurrencySymbol("RUB")}`,
		sortingFn: (rowA, rowB) => {
			const accruedIntA = rowA.original.ACCRUEDINT || 0;
			const accruedIntB = rowB.original.ACCRUEDINT || 0;
			return accruedIntA - accruedIntB;
		},
	},
	{
		accessorKey: "NEXTCOUPON",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Следующий купон</TooltipTrigger>
					<TooltipContent>
						<p>Дата следующей купонной выплаты</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => <span className="text-xs">{row.original.NEXTCOUPON}</span>,
	},
	{
		accessorKey: "MATDATE",

		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Погашение</TooltipTrigger>
					<TooltipContent>
						<p>Дата погашения облигации</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => <span className="text-xs">{row.original.MATDATE}</span>,
	},
	{
		accessorKey: "QUANTITY",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Кол-во</TooltipTrigger>
					<TooltipContent>
						<p>Количество облигаций в портфеле</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Input
					type="number"
					value={bond.quantity}
					onChange={(e) => bond.handleQuantityChange(bond.SECID, parseInt(e.target.value))}
					onBlur={(e) => {
						// If input is empty, reset to 1 and update both state and server
						const newValue = e.target.value === "" ? 1 : parseInt(e.target.value);
						bond.handleQuantityChange(bond.SECID, newValue);
						bond.handleQuantityBlur({ ...bond, quantity: newValue });
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							bond.handleQuantityBlur(bond);
							(e.target as HTMLElement).blur();
						}
					}}
					className="w-12"
					aria-label={`Количество ${bond.SHORTNAME}`}
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
					aria-label={`Удалить ${bond.SHORTNAME} из портфеля`}
				>
					<Trash className="size-4" />
				</Button>
			);
		},
		enableSorting: false,
	},
];
