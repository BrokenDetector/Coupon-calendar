"use client";

import { fetchBonds } from "@/actions/fetch-bonds";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./ui/input";

interface SelectListProps {
	options: MOEXBondData[];
	onBondUpdate: (bond: Bond) => void;
	bonds: Bond[];
}

const SelectList: FC<SelectListProps> = memo(({ options, onBondUpdate, bonds }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [isListVisible, setIsListVisible] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const filteredOptions = useMemo(() => {
		return options.filter(
			(option) =>
				option.SHORTNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(option.ISIN && option.ISIN.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(option.SECID && option.SECID.toLowerCase().includes(searchTerm.toLowerCase()))
		);
	}, [options, searchTerm]);

	const rowVirtualizer = useVirtualizer({
		count: filteredOptions.length,
		getScrollElement: () => listRef.current,
		estimateSize: () => 55,
		overscan: 5,
	});

	const handleSelect = async (bond: MOEXBondData) => {
		const selectedBond = await fetchBonds([{ SECID: bond.SECID, quantity: 1, purchasePrice: null }], true);
		const bondExist = bonds.find((b) => b.SECID === bond.SECID);
		const quantity = bondExist ? bondExist.quantity! + 1 : 1;
		const bondWithQuantity = { ...selectedBond[0], quantity };

		setIsListVisible(false);
		onBondUpdate(bondWithQuantity);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsListVisible(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="flex flex-col p-2 space-y-2 w-full max-w-80">
			<div
				className="relative"
				ref={dropdownRef}
			>
				<div className="grid relative grid-cols-4 items-center rounded-md cursor-pointer shadow-xs min-w-50">
					<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />

					<Input
						type="text"
						value={searchTerm}
						onChange={handleInputChange}
						placeholder="Быстрый поиск облигаций"
						className="col-span-4 p-2 pl-10 rounded-md bg-muted"
						aria-label="Search bonds"
						onClick={(e) => e.stopPropagation()}
						onFocus={() => setIsListVisible(true)}
					/>
				</div>
				{isListVisible && filteredOptions.length > 0 && (
					<div
						ref={listRef}
						className="overflow-auto absolute z-50 mt-1 w-full max-h-60 rounded-md border shadow-lg bg-muted"
					>
						<div
							className="relative"
							style={{
								height: `${rowVirtualizer.getTotalSize()}px`,
							}}
						>
							{rowVirtualizer.getVirtualItems().map((virtualRow) => {
								const bond = filteredOptions[virtualRow.index];
								return (
									<div
										key={virtualRow.index}
										className="absolute top-0 left-0 w-full"
										style={{
											height: `${virtualRow.size}px`,
											transform: `translateY(${virtualRow.start}px)`,
										}}
									>
										<div
											onClick={() => handleSelect(bond)}
											className="flex flex-col p-2 h-full text-left cursor-pointer hover:bg-muted-foreground/30"
										>
											<span>{bond.SHORTNAME}</span>
											<span className="ml-0 text-xs text-muted-foreground">{bond.ISIN}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
});

export default SelectList;

SelectList.displayName = "SelectList";
