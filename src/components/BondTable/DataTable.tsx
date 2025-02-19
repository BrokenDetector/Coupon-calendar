"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { BsToggles } from "react-icons/bs";
import { Button, buttonVariants } from "../ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { MemoizedRow } from "./MemoizedRow";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	maxHeight?: string;
	filterPlaceholder?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	maxHeight,
	filterPlaceholder,
}: DataTableProps<TData, TValue>) {
	const searchParams = useSearchParams();

	const deserializeSortingState = (): SortingState => {
		const sortingState: SortingState = [];

		Array.from(searchParams?.keys() || []).forEach((key) => {
			if (key.startsWith("order_by_")) {
				const columnId = key.replace("order_by_", "");
				const direction = searchParams?.get(key);
				if (direction === "asc" || direction === "desc") {
					sortingState.push({ id: columnId, desc: direction === "desc" });
				}
			}
		});

		return sortingState.length ? sortingState : [];
	};

	const deserializeColumnVisibility = (): VisibilityState => {
		const hiddenColumns = searchParams?.get("hidden_columns") || "";
		const hiddenColumnIds = hiddenColumns.split("-").filter((id) => id.trim() !== "");

		const visibilityState: VisibilityState = {};
		hiddenColumnIds.forEach((column) => {
			visibilityState[column] = false;
		});

		return visibilityState;
	};

	const initialSearchQuery = decodeURIComponent(searchParams?.get("search") || "");
	const [sorting, setSorting] = useState<SortingState>(deserializeSortingState());
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{
			id: "SHORTNAME",
			value: initialSearchQuery,
		},
	]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(deserializeColumnVisibility());

	const updateParams = (key: string, value: any) => {
		const params = new URLSearchParams(searchParams?.toString() || "");

		if (key === "search") {
			params.set(key, value?.[0]?.value || "");
		} else if (key === "sorting") {
			Array.from(params.keys()).forEach((k) => {
				if (k.startsWith("order_by_")) params.delete(k);
			});
			value.forEach(({ id, desc }: { id: string; desc: boolean }) => {
				params.set(`order_by_${id}`, desc ? "desc" : "asc");
			});
		} else if (key === "hidden_columns") {
			const hiddenColumns = Object.entries(value)
				.filter(([_, isVisible]) => !isVisible)
				.map(([columnId]) => columnId)
				.join("-");

			if (hiddenColumns.length > 0) {
				params.set("hidden_columns", hiddenColumns);
			} else {
				params.delete("hidden_columns");
			}
		} else {
			params.set(key, value);
		}

		// Replace current URL without page rerender in local portfolio
		// (otherwise it show toast notification about loading bonds again)
		window.history.replaceState(null, "", `?${params.toString()}`);
	};

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: (updater) => {
			const newSorting = typeof updater === "function" ? updater(sorting) : updater;
			setSorting(newSorting);
			updateParams("sorting", newSorting);
		},
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: (updater) => {
			const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
			setColumnFilters(newFilters);
			updateParams("search", newFilters);
		},
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: (updater) => {
			const newVisibility = typeof updater === "function" ? updater(columnVisibility) : updater;
			setColumnVisibility(newVisibility);
			updateParams("hidden_columns", newVisibility);
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	});

	const parentRef = useRef<HTMLTableElement>(null);
	const rowVirtualizer = useVirtualizer({
		count: table.getRowModel().rows.length,
		getScrollElement: () => parentRef.current?.parentElement!,
		estimateSize: () => 45,
		overscan: 7,
	});

	return (
		<div>
			<div className="flex items-center py-4 gap-2">
				{filterPlaceholder && (
					<div className="relative max-w-sm w-full">
						<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
						<Input
							placeholder={filterPlaceholder}
							value={(table.getColumn("SHORTNAME")?.getFilterValue() as string) || ""}
							onChange={(event) => table.getColumn("SHORTNAME")?.setFilterValue(event.target.value)}
							className="pl-8 bg-muted max-w-80"
						/>
					</div>
				)}
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
				<Table
					divClassname={cn("overflow-auto", maxHeight ? maxHeight : "")}
					ref={parentRef}
				>
					<TableHeader className="sticky top-0 shadow-lg text-xs bg-card z-10">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="flex w-full border-b"
							>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className="flex-shrink-0 border-r last:border-r-0"
										style={{
											width: header.getSize(),
										}}
									>
										{header.isPlaceholder ? null : (
											<div
												className={cn(
													buttonVariants({
														variant: "ghost",
														size: "sm",
													}),
													"text-xs text-center px-0 flex flex-row justify-center items-center whitespace-normal leading-tight",
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
													<>
														{header.column.getIsSorted() === "asc" ? (
															<ArrowUp className="ml-2 size-3 flex-shrink-0" />
														) : header.column.getIsSorted() === "desc" ? (
															<ArrowDown className="ml-2 size-3 flex-shrink-0" />
														) : (
															<ArrowUpDown className="ml-2 size-3 flex-shrink-0 text-muted-foreground" />
														)}
													</>
												)}
											</div>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody
						className="z-[1] relative"
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
						}}
					>
						{rowVirtualizer.getVirtualItems().length ? (
							<>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => {
									const row = table.getRowModel().rows[virtualRow.index];
									return (
										<MemoizedRow
											key={row.id}
											row={row}
											virtualRow={virtualRow}
											columnFilters={columnFilters}
											columnVisibility={columnVisibility}
											sorting={sorting}
										/>
									);
								})}
							</>
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
