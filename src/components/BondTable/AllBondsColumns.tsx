import { getCurrencySymbol } from "@/helpers/getCurrencySymbol";
import { ColumnDef } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const columns: ColumnDef<Bond>[] = [
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
							дюрацией более волатильны. Измеряется в днях.
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
];
