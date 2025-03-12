import { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";

export type FilterType = "text" | "select" | "number" | "date" | "boolean";

export interface FilterField<TData> {
	id: string;
	type: FilterType;
	label: string;
	options?: { label: string; value: string | number }[];
}

export interface DataTableState {
	sorting: SortingState;
	columnVisibility: VisibilityState;
	columnFilters: {
		id: string;
		value: any;
	}[];
	globalFilter: string;
}

export interface DataTableOptions<TData, TValue> {
	data: TData[];
	columns: ColumnDef<TData, TValue>[];
	filterFields?: FilterField<TData>[];
	initialState?: Partial<DataTableState>;
}
