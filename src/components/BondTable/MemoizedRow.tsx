import { ColumnFiltersState, Row, SortingState, VisibilityState, flexRender } from "@tanstack/react-table";
import { VirtualItem } from "@tanstack/react-virtual";
import { memo } from "react";
import { TableCell, TableRow } from "../ui/table";

interface MemoizedRowProps<T> {
	row: Row<T>;
	virtualRow: VirtualItem;
	columnFilters: ColumnFiltersState;
	columnVisibility: VisibilityState;
	sorting: SortingState;
}

const hasPortfolioFields = (value: unknown): value is { quantity: number; purchasePrice: number } => {
	return typeof value === "object" && value !== null && "quantity" in value && "purchasePrice" in value;
};

export const MemoizedRow = memo(
	function RowComponent<TData>({ row, virtualRow }: MemoizedRowProps<TData>) {
		return (
			<TableRow
				data-state={row.getIsSelected() && "selected"}
				className="flex absolute w-full border-b"
				style={{
					height: `${virtualRow.size}px`,
					top: `${virtualRow.start}px`,
				}}
			>
				{row.getVisibleCells().map((cell) => (
					<TableCell
						key={cell.id}
						style={{
							width: cell.column.getSize(),
						}}
						className="flex overflow-x-auto overflow-y-hidden justify-center items-center text-sm whitespace-nowrap border-r last:border-r-0"
					>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				))}
			</TableRow>
		);
	},
	<T,>(prevProps: MemoizedRowProps<T>, nextProps: MemoizedRowProps<T>) => {
		const prevValues = prevProps.row.original;
		const nextValues = nextProps.row.original;

		const filtersEqual = JSON.stringify(prevProps.columnFilters) === JSON.stringify(nextProps.columnFilters);
		const visibilityEqual =
			JSON.stringify(prevProps.columnVisibility) === JSON.stringify(nextProps.columnVisibility);
		const sortingEqual = JSON.stringify(prevProps.sorting) === JSON.stringify(nextProps.sorting);
		const virtualPositionEqual =
			prevProps.virtualRow.start === nextProps.virtualRow.start &&
			prevProps.virtualRow.size === nextProps.virtualRow.size;

		// For MyBondsCard - check quantity, price, and virtual position
		if (hasPortfolioFields(prevValues) && hasPortfolioFields(nextValues)) {
			return (
				prevValues.quantity === nextValues.quantity &&
				prevValues.purchasePrice === nextValues.purchasePrice &&
				virtualPositionEqual &&
				filtersEqual &&
				visibilityEqual &&
				sortingEqual
			);
		}

		return virtualPositionEqual && filtersEqual && visibilityEqual && sortingEqual;
	}
) as unknown as {
	<T>(props: MemoizedRowProps<T>): JSX.Element;
	displayName?: string;
};

MemoizedRow.displayName = "MemoizedRow";
