import {
	ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import type { DataTableOptions } from "../types/table";

export const useDataTable = <TData extends object, TValue>({ data, columns }: DataTableOptions<TData, TValue>) => {
	const tableContainerRef = useRef<HTMLTableElement>(null);
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

	const [sorting, setSorting] = useState<SortingState>(deserializeSortingState());
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{
			id: "SHORTNAME",
			value: searchParams?.get("search") || "",
		},
	]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(deserializeColumnVisibility());

	const updateParams = (key: string, value: any) => {
		const params = new URLSearchParams(searchParams?.toString() || "");

		if (key === "search") {
			params.set(key, value);
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
			// update only search param
			updateParams("search", newFilters.find((f) => f.id === "SHORTNAME")?.value || "");
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
			// TYPE column is only for filtering
			columnVisibility: { ...columnVisibility, TYPE: false },
		},
	});

	const virtualizer = useVirtualizer({
		count: table.getRowModel().rows.length,
		getScrollElement: () => tableContainerRef.current?.parentElement!,
		estimateSize: () => 45,
		overscan: 7,
	});

	return {
		table,
		virtualizer,
		tableContainerRef,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
		},
	};
};
