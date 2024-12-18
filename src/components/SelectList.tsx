"use client";

import { fetchBondsInChunks } from "@/actions/fetch-bond";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { FC, memo, useEffect, useRef, useState } from "react";
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

	const filteredOptions = options.filter(
		(option) =>
			option.SHORTNAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(option.ISIN && option.ISIN.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(option.SECID && option.SECID.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const handleSelect = async (bond: Bond) => {
		const selectedBond = await fetchBondsInChunks([bond], true);
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
		<div className="flex flex-col space-y-2 w-full max-w-80 p-4">
			<div
				className="relative"
				ref={dropdownRef}
			>
				<div className="relative grid grid-cols-4 items-center cursor-pointer border rounded-md shadow-sm min-w-50">
					<Input
						type="text"
						value={searchTerm}
						onChange={handleInputChange}
						placeholder="Поиск облигаций"
						className="p-2 pl-10 rounded-md col-span-4 bg-muted"
						aria-label="Search bonds"
						onClick={(e) => e.stopPropagation()}
						onFocus={() => setIsListVisible(true)}
					/>
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					{isListVisible ? (
						<ChevronUp
							className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
							onClick={() => setIsListVisible(false)}
						/>
					) : (
						<ChevronDown
							className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
							onClick={() => setIsListVisible(true)}
						/>
					)}
				</div>
				{isListVisible && filteredOptions.length > 0 && (
					<ul className="absolute z-10 w-full mt-1 bg-muted border rounded-md shadow-lg max-h-60 overflow-auto">
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
