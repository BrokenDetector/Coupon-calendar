import { useDataTable } from "@/hooks/useDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableContent } from "./DataTableContent";
import { DataTableToolbar } from "./DataTableToolbar";

interface DataTableProps<TData extends { SECID: string }, TValue> {
	data: TData[];
	columns: ColumnDef<TData, TValue>[];
	className?: string;
	placeholder?: string;
}

export function DataTable<TData extends { SECID: string }, TValue>({
	data,
	columns,
	className,
	placeholder,
}: DataTableProps<TData, TValue>) {
	const { table, virtualizer, tableContainerRef } = useDataTable<TData, TValue>({
		data,
		columns,
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center">
				<DataTableToolbar
					table={table}
					placeholder={placeholder}
				/>
			</div>
			<DataTableContent
				table={table}
				virtualizer={virtualizer}
				tableContainerRef={tableContainerRef}
				className={className}
			/>
		</div>
	);
}
