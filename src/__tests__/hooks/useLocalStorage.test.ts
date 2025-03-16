import { useLocalStorage } from "@/hooks/useLocalStorage";
import { act, renderHook } from "@testing-library/react";

describe("useLocalStorage", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	test("should initialize with default value", () => {
		const { result } = renderHook(() => useLocalStorage("testKey"));
		expect(result.current.getLocalData()).toEqual([]);
	});

	test("should set and get data correctly", () => {
		const { result } = renderHook(() => useLocalStorage("testKey"));

		act(() => {
			result.current.setLocalData(["test"]);
		});

		expect(result.current.getLocalData()).toEqual(["test"]);
	});

	test("should persist data between hook instances", () => {
		const { result: result1 } = renderHook(() => useLocalStorage("testKey"));

		act(() => {
			result1.current.setLocalData(["test"]);
		});

		const { result: result2 } = renderHook(() => useLocalStorage("testKey"));
		expect(result2.current.getLocalData()).toEqual(["test"]);
	});

	test("should handle invalid JSON in localStorage", () => {
		// Mock console.error to prevent test output noise
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		localStorage.setItem("testKey", "invalid json");
		const { result } = renderHook(() => useLocalStorage("testKey"));

		expect(result.current.getLocalData()).toEqual([]);

		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});
});
