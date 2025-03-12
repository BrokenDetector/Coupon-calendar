import { cn } from "@/lib/utils";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { RefObject } from "react";
import { buttonVariants } from "../ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { MemoizedRow } from "./MemoizedRow";

interface DataTableContentProps<TData extends { SECID: string }, TValue> {
	table: ReactTable<TData>;
	virtualizer: Virtualizer<any, any>;
	tableContainerRef: RefObject<HTMLTableElement>;
	className?: string;
}

export function DataTableContent<TData extends { SECID: string }, TValue>({
	table,
	className,
	virtualizer,
	tableContainerRef,
}: DataTableContentProps<TData, TValue>) {
	const { sorting, columnFilters, columnVisibility } = table.getState();

	return (
		<div className="rounded-md border bg-background/20">
			<Table
				divClassname={cn("overflow-auto", className)}
				ref={tableContainerRef}
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
									className="flex-shrink-0 border-r last:border-r-0 p-1"
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
						height: `${virtualizer.getTotalSize()}px`,
					}}
				>
					{virtualizer.getVirtualItems().map((virtualRow) => {
						const row = table.getRowModel().rows[virtualRow.index];
						return (
							<MemoizedRow
								key={row.original.SECID || row.id}
								row={row}
								virtualRow={virtualRow}
								columnFilters={columnFilters}
								columnVisibility={columnVisibility}
								sorting={sorting}
							/>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
