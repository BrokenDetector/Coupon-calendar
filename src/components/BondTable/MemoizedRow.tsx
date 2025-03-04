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

export const MemoizedRow = memo(
	function RowComponent<TData>({ row, virtualRow }: MemoizedRowProps<TData>) {
		return (
			<TableRow
				data-state={row.getIsSelected() && "selected"}
				className="absolute flex w-full border-b"
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
						className="flex items-center justify-center text-sm border-r last:border-r-0 overflow-y-hidden overflow-x-auto whitespace-nowrap"
					>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				))}
			</TableRow>
		);
	},
	<T,>(prevProps: MemoizedRowProps<T>, nextProps: MemoizedRowProps<T>) => {
		const prevValues = prevProps.row.original as any;
		const nextValues = nextProps.row.original as any;

		const filtersEqual = JSON.stringify(prevProps.columnFilters) === JSON.stringify(nextProps.columnFilters);
		const visibilityEqual =
			JSON.stringify(prevProps.columnVisibility) === JSON.stringify(nextProps.columnVisibility);
		const sortingEqual = JSON.stringify(prevProps.sorting) === JSON.stringify(nextProps.sorting);
		const virtualPositionEqual =
			prevProps.virtualRow.start === nextProps.virtualRow.start &&
			prevProps.virtualRow.size === nextProps.virtualRow.size;

		// For MyBondsCard - check quantity, price, and virtual position
		if ("quantity" in prevValues && "purchasePrice" in prevValues) {
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
	(props: MemoizedRowProps<any>): JSX.Element;
	displayName?: string;
};

MemoizedRow.displayName = "MemoizedRow";
