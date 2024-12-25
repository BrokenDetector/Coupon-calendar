"use client";

import { fetchBonds } from "@/actions/fetch-bond";
import { Search } from "lucide-react";
import { FC, memo, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./ui/input";

interface SelectListProps {
	options: Bond[];
	onBondUpdate: (bond: Bond) => void;
	bonds: Bond[];
}

const SelectList: FC<SelectListProps> = memo(function SelectList({ options, onBondUpdate, bonds }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [isListVisible, setIsListVisible] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

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

	const handleSelect = async (bond: Bond) => {
		const selectedBond = await fetchBonds([bond], true);
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
		<div className="flex flex-col space-y-2 w-full max-w-80 p-2">
			<div
				className="relative"
				ref={dropdownRef}
			>
				<div className="relative grid grid-cols-4 items-center cursor-pointer border rounded-md shadow-sm min-w-50">
					<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />

					<Input
						type="text"
						value={searchTerm}
						onChange={handleInputChange}
						placeholder="Быстрый поиск облигаций"
						className="p-2 pl-10 rounded-md col-span-4 bg-muted"
						aria-label="Search bonds"
						onClick={(e) => e.stopPropagation()}
						onFocus={() => setIsListVisible(true)}
					/>
				</div>
				{isListVisible && filteredOptions.length > 0 && (
					<ul className="absolute z-50 w-full mt-1 bg-muted border rounded-md shadow-lg max-h-60 overflow-auto">
						{filteredOptions.map((bond, index) => (
							<li
								key={index}
								onClick={() => handleSelect(bond)}
								className="p-2 hover:bg-muted-foreground/30 cursor-pointer flex flex-col text-left"
							>
								<span>{bond.SHORTNAME}</span>
								<span className="text-xs ml-0 text-muted-foreground">{bond.ISIN}</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
});

export default SelectList;
