import { cn } from "@/lib/utils";
import { FilterType } from "@/types/table";
import { Table } from "@tanstack/react-table";
import { FilterX, SlidersHorizontal } from "lucide-react";
import { BsToggles } from "react-icons/bs";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	placeholder?: string;
}

export function DataTableToolbar<TData>({ table, placeholder = "Поиск" }: DataTableToolbarProps<TData>) {
	const hasFilters = table.getState().columnFilters
		? table.getState().columnFilters.filter((f) => f.id !== "SHORTNAME").length > 0
		: false;

	const filterFields = [
		{
			id: "TYPE",
			type: "select" as FilterType,
			label: "Тип",
			options: [
				{ label: "Корпоративные", value: "corporate_bond" },
				{ label: "Государственные", value: "ofz_bond" },
				{ label: "Муниципальные", value: "subfederal_bond" },
			],
		},
		{
			id: "COUPONPERIOD",
			type: "select" as FilterType,
			label: "Частота купона",
			options: [
				{ label: "Ежегодно", value: "365" },
				{ label: "Полугодично", value: "182" },
				{ label: "Ежеквартально", value: "91" },
				{ label: "Ежемесячно", value: "30" },
			],
		},
		{
			id: "MATDATE",
			type: "select" as FilterType,
			label: "Срок погашения",
			options: [
				{ label: "До 1 года", value: "0-1" },
				{ label: "1-3 года", value: "1-3" },
				{ label: "3-5 лет", value: "3-5" },
				{ label: "Более 5 лет", value: "5+" },
			],
		},
	];

	return (
		<div className="flex gap-2 flex-row sm:items-center sm:justify-between w-full">
			<div className="flex flex-1 items-center gap-2 flex-wrap">
				<Input
					placeholder={placeholder}
					value={(table.getColumn("SHORTNAME")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("SHORTNAME")?.setFilterValue(event.target.value)}
					className="max-w-full sm:max-w-sm min-w-[150px] flex-1 bg-muted"
				/>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className={cn(hasFilters && "text-primary")}
						>
							<SlidersHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="max-h-[300px] overflow-y-auto"
					>
						{filterFields?.map((field) => (
							<div key={field.id}>
								<DropdownMenuLabel>{field.label}</DropdownMenuLabel>
								{field.type === "select" &&
									field.options?.map((option, index) => (
										<DropdownMenuCheckboxItem
											key={index}
											checked={
												Array.isArray(table.getColumn(field.id)?.getFilterValue())
													? (
															table.getColumn(field.id)?.getFilterValue() as (
																| string
																| number
															)[]
													  )?.includes(option.value)
													: false
											}
											onCheckedChange={(checked) => {
												const column = table.getColumn(field.id);
												const values = (column?.getFilterValue() as (string | number)[]) || [];
												column?.setFilterValue(
													checked
														? [...values, option.value]
														: values.filter((v) => v !== option.value)
												);
											}}
										>
											{option.label}
										</DropdownMenuCheckboxItem>
									))}
							</div>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{hasFilters && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => table.resetColumnFilters()}
						className="text-muted-foreground hover:text-primary"
					>
						<FilterX className="size-4" />
					</Button>
				)}
			</div>

			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="ml-auto mt-0.5 sm:mt-0"
						size="sm"
					>
						<BsToggles className="sm:mr-1 size-4" />
						<span className="hidden sm:flex">Настроить столбцы</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="max-h-[300px] overflow-y-auto"
				>
					<DropdownMenuLabel>Настроить столбцы</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{table
						.getAllColumns()
						.filter((column) => column.getCanHide())
						.map((column) => {
							return (
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
							);
						})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
