import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	SortingState,   
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Filter } from "lucide-react";
import { useState } from "react";
import { BsToggles } from "react-icons/bs";
import { Button, buttonVariants } from "../ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	return (
		<div>
			<div className="flex items-center py-4 gap-2">
				<div className="relative max-w-sm w-full">
					<Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
					<Input
						placeholder="Поиск по портфелю"
						value={(table.getColumn("SHORTNAME")?.getFilterValue() as string) || ""}
						onChange={(event) => table.getColumn("SHORTNAME")?.setFilterValue(event.target.value)}
						className="pl-8 bg-muted"
					/>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="ml-auto"
							size={"sm"}
						>
							<BsToggles className="mr-1 size-4" />
							Настроить столбцы
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => (
								<DropdownMenuCheckboxItem
									key={column.id}
									className="capitalize"
									checked={column.getIsVisible()}
									onCheckedChange={(value) => column.toggleVisibility(!!value)}
								>
									{typeof column.columnDef.header === "function"
										? //@ts-ignore
										  column.columnDef.header({ column })
										: column.columnDef.header || column.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border bg-background/20">
				<Table divClassname="max-h-[350px] overflow-auto">
					<TableHeader className="sticky top-0 shadow-lg text-xs bg-card">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className="max-w-24"
									>
										{header.isPlaceholder ? null : (
											<div
												className={cn(
													buttonVariants({
														variant: "ghost",
														size: "sm",
													}),
													"text-xs px-0 flex flex-row justify-center items-center whitespace-normal leading-tight",
													!header.column.getCanSort() &&
														"cursor-default hover:bg-inherit hover:text-inherits"
												)}
												onClick={() => {
													if (header.column.getCanSort()) {
														header.column.toggleSorting();
													}
												}}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}

												{header.column.getCanSort() && (
													<ArrowUpDown className={"ml-2 size-3 flex-shrink-0 "} />
												)}
											</div>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="whitespace-nowrap text-center"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Нет облигаций
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
