import { useDataTable } from "@/hooks/useDataTable";
import { act, renderHook } from "@testing-library/react";

// Mock the useSearchParams hook
jest.mock("next/navigation", () => ({
	useSearchParams: () => new URLSearchParams(""),
}));

describe("useDataTable", () => {
	const mockData = [
		{ SECID: "1", SHORTNAME: "Bond1", TYPE: "ofz_bond" },
		{ SECID: "2", SHORTNAME: "Bond2", TYPE: "corporate_bond" },
	];

	const mockColumns = [
		{ id: "SHORTNAME", accessorKey: "SHORTNAME" },
		{ id: "TYPE", accessorKey: "TYPE" },
		{ id: "SECID", accessorKey: "SECID" },
	];

	test("should initialize with correct default states", () => {
		const { result } = renderHook(() =>
			useDataTable({
				data: mockData,
				columns: mockColumns,
			})
		);

		expect(result.current.state.sorting).toEqual([]);
		expect(result.current.state.columnFilters).toEqual([{ id: "SHORTNAME", value: "" }]);
		expect(result.current.state.columnVisibility).toEqual({});
		expect(result.current.table.getState().columnVisibility).toEqual({
			TYPE: false,
		});
	});

	test("should handle column visibility changes", () => {
		const { result } = renderHook(() =>
			useDataTable({
				data: mockData,
				columns: mockColumns,
			})
		);

		act(() => {
			result.current.table.setColumnVisibility({ SECID: false });
		});

		expect(result.current.state.columnVisibility).toEqual({
			SECID: false,
		});
		expect(result.current.table.getState().columnVisibility).toEqual({
			SECID: false,
			TYPE: false,
		});
	});

	test("should handle sorting changes", () => {
		const { result } = renderHook(() =>
			useDataTable({
				data: mockData,
				columns: mockColumns,
			})
		);

		act(() => {
			result.current.table.setSorting([{ id: "SHORTNAME", desc: true }]);
		});

		expect(result.current.state.sorting).toEqual([{ id: "SHORTNAME", desc: true }]);
	});

	test("should handle filtering", () => {
		const { result } = renderHook(() =>
			useDataTable({
				data: mockData,
				columns: mockColumns,
			})
		);

		act(() => {
			result.current.table.setColumnFilters([{ id: "SHORTNAME", value: "Bond1" }]);
		});

		const filteredRows = result.current.table.getFilteredRowModel().rows;
		expect(filteredRows).toHaveLength(1);
		expect(filteredRows[0].original).toEqual(mockData[0]);
	});

	test("should setup virtualizer correctly", () => {
		const { result } = renderHook(() =>
			useDataTable({
				data: mockData,
				columns: mockColumns,
			})
		);

		expect(result.current.virtualizer).toBeDefined();
		expect(result.current.virtualizer.getVirtualItems()).toBeDefined();
	});
});
