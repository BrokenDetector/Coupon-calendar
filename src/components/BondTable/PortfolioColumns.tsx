import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ExtendedBond extends Bond {
	handleQuantityBlur: (bond: Bond) => void;
	handlePriceBlur: (bond: Bond, newPrice: number) => void;
	handleBondRemove: (SECID: string) => void;
	handleQuantityChange: (secId: string, value: number) => void;
	handlePriceChange: (secId: string, price: number) => void;
}

const COUPON_FREQUENCIES = [
	{ value: 365, range: [300, 400] },
	{ value: 182, range: [150, 200] },
	{ value: 91, range: [80, 100] },
	{ value: 30, range: [25, 35] },
];

const calculateYearsToMaturity = (maturityDate: string): number => {
	const now = new Date();
	const diffTime = new Date(maturityDate).getTime() - now.getTime();
	return diffTime / (1000 * 60 * 60 * 24 * 365.25);
};

export const columns: ColumnDef<ExtendedBond>[] = [
	{
		accessorKey: "SHORTNAME",
		header: "Облигация",
		size: 170,
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<div className="flex flex-col justify-start items-start px-9 w-full text-left">
					<span className="text-sm font-bold">{bond.SHORTNAME}</span>
					<span className="text-xs text-muted-foreground">{bond.ISIN}</span>
				</div>
			);
		},
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
		size: 110,
		cell: ({ row }) => {
			const bond = row.original;
			return `${bond.FACEVALUE || 0} ${getCurrencySymbol(bond.FACEUNIT)}`;
		},
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
		size: 100,
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Input
					type="text"
					placeholder="Введите %"
					value={bond.purchasePrice || ""}
					onBlur={(e) => {
						let value = e.target.value;
						if ((value.endsWith(".") || value.endsWith(",")) && /^\d+[.,]$/.test(value)) {
							value = value.slice(0, -1);
						}
						const numValue = value === "" ? 100 : parseFloat(value.replace(",", "."));
						if (!isNaN(numValue)) {
							bond.handlePriceBlur(bond, numValue);
						}
					}}
					aria-label={`Цена покупки ${bond.SHORTNAME}`}
					onChange={(e) => {
						const value = e.target.value;
						// Allow numbers and single dot or comma
						if (/^$|^\d*[.,]?\d*$/.test(value)) {
							// @ts-ignore
							bond.handlePriceChange(bond.SECID, value.replace(",", "."));
						}
					}}
					className="w-18"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
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
		size: 100,
		cell: ({ row }) => {
			const bond = row.original;
			return bond.CURRENTPRICE ? `${bond.CURRENTPRICE.toFixed(2)}%` : "Н/Д";
		},
		sortingFn: (rowA, rowB) => {
			const currPriceA = rowA.original.CURRENTPRICE || 0;
			const currPriceB = rowB.original.CURRENTPRICE || 0;
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
		size: 100,
		cell: ({ row }) => {
			const bond = row.original;
			return bond.COUPONVALUE ? `${bond.COUPONVALUE} ${getCurrencySymbol(bond.FACEUNIT)}` : "Н/Д";
		},
		sortingFn: (rowA, rowB) => {
			const couponA = rowA.original.COUPONVALUE || 0;
			const couponB = rowB.original.COUPONVALUE || 0;
			return couponA - couponB;
		},
	},
	{
		accessorKey: "COUPONPERCENT",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Ставка купона</TooltipTrigger>
					<TooltipContent>
						<p>Годовая ставка купона в процентах</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		size: 90,
		cell: ({ row }) => {
			const bond = row.original;
			return bond.COUPONPERCENT ? `${bond.COUPONPERCENT.toFixed(2)}%` : "Н/Д";
		},
		sortingFn: (rowA, rowB) => {
			const percentA = rowA.original.COUPONPERCENT || 0;
			const percentB = rowB.original.COUPONPERCENT || 0;
			return percentA - percentB;
		},
	},
	{
		accessorKey: "COUPONPERIOD",
		header: () => (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Период купона</TooltipTrigger>
					<TooltipContent>
						<p>Количество дней между выплатами купона</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		),
		size: 80,
		cell: ({ row }) => {
			const bond = row.original;
			return bond.COUPONFREQUENCY || "Н/Д";
		},
		sortingFn: (rowA, rowB) => {
			const periodA = rowA.original.COUPONFREQUENCY || 0;
			const periodB = rowB.original.COUPONFREQUENCY || 0;
			return periodA - periodB;
		},
		filterFn: (row, columnId, filterValue) => {
			if (!filterValue?.length) return true;
			return filterValue.some((freq: string) => {
				const frequencyRange = COUPON_FREQUENCIES.find((f) => f.value === parseInt(freq))?.range;
				if (!frequencyRange) return false;
				const couponPeriod = row.original.COUPONFREQUENCY || 0;
				return couponPeriod >= frequencyRange[0] && couponPeriod <= frequencyRange[1];
			});
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
		size: 110,
		cell: ({ row }) => {
			const bond = row.original;
			return bond.CURRENTYIELD ? `${bond.CURRENTYIELD.toFixed(2)} %` : "Н/Д";
		},
		sortingFn: (rowA, rowB) => {
			const currYieldA = rowA.original.CURRENTYIELD || 0;
			const currYieldB = rowB.original.CURRENTYIELD || 0;
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
		size: 100,
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
		size: 80,
		cell: ({ row }) => {
			const bond = row.original;
			return bond.DURATION || "Н/Д";
		},
		sortingFn: (rowA, rowB) => {
			const durationA = rowA.original.DURATION || 0;
			const durationB = rowB.original.DURATION || 0;
			return durationA - durationB;
		},
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
		size: 100,
		cell: ({ row }) => {
			const bond = row.original;
			return `${bond.ACCRUEDINT?.toFixed(2) || 0} ${getCurrencySymbol("RUB")}`;
		},
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
		size: 110,
		cell: ({ row }) => <span className={cn("text-xs")}>{row.original.NEXTCOUPON || "Погашена"}</span>,
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
		size: 100,
		cell: ({ row }) => {
			return <span className={cn("text-xs")}>{row.original.MATDATE || "Погашена"}</span>;
		},
		filterFn: (row, columnId, filterValue) => {
			if (!filterValue?.length) return true;
			const yearsToMaturity = calculateYearsToMaturity(row.original.MATDATE || "");

			return filterValue.some((range: string) => {
				if (range === "5+") return yearsToMaturity > 5;
				const [min, max] = range.split("-").map(Number);
				return yearsToMaturity >= min && yearsToMaturity <= max;
			});
		},
	},
	{
		accessorKey: "TYPE",
		filterFn: (row, columnId, filterValue) => {
			if (!filterValue?.length) return true;
			return filterValue.includes(row.original.TYPE);
		},
		enableHiding: false,
		size: 0,
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
		size: 80,
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Input
					type="text"
					value={bond.quantity || ""}
					onChange={(e) => {
						const value = e.target.value;
						if (/^$|^\d*$/.test(value)) {
							bond.handleQuantityChange(bond.SECID, parseInt(value));
						}
					}}
					onBlur={(e) => {
						// If input is empty, reset to 1 and update both state and server
						const newValue = e.target.value === "" ? 1 : parseInt(e.target.value);
						if (!isNaN(newValue)) {
							bond.handleQuantityBlur({ ...bond, quantity: newValue });
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							(e.target as HTMLElement).blur();
						}
					}}
					className="w-14"
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
		size: 80,
		cell: ({ row }) => {
			const bond = row.original;
			return (
				<Button
					onClick={() => bond.handleBondRemove(bond.SECID)}
					variant={"ghost"}
					className="rounded-lg text-destructive hover:text-destructive/90 h-fit"
					aria-label={`Удалить ${bond.SHORTNAME} из портфеля`}
				>
					<Trash className="size-4" />
				</Button>
			);
		},
		enableSorting: false,
	},
];
