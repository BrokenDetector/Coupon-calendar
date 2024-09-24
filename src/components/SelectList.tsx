"use client";

import { useBonds } from "@/context/BondContext";
import { fetchBondCoupons } from "@/lib/bondService";
import { Bond } from "@/types/bond";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

interface SelectListProps {
	options: Bond[];
}

const SelectList: FC<SelectListProps> = ({ options }) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [isListVisible, setIsListVisible] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { setBonds } = useBonds();

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const filteredOptions = options.filter((option) =>
		option.SHORTNAME.toLowerCase().includes(searchTerm.toLowerCase())
	);
	const handleSelect = async (secid: string, quantity: number = 1) => {
		const selectedBond = await fetchBondCoupons(secid);
		const bondWithQuantity = { ...selectedBond, quantity };

		const oldLocalStorage = localStorage.getItem("BONDSECIDS");
		if (oldLocalStorage) {
			const data = JSON.parse(oldLocalStorage);

			// Ensure data is an array of objects
			const updatedData = Array.isArray(data) ? data : [];
			// Check if the bond is already in the list and update the quantity if necessary
			const existingBond = updatedData.find((bond: any) => bond.secid === secid);
			if (existingBond) {
				existingBond.quantity += quantity; // Update quantity
			} else {
				// Push the new bond with quantity
				updatedData.push({ SECID: secid, quantity });
			}

			// Store the updated array back to localStorage
			localStorage.setItem("BONDSECIDS", JSON.stringify(updatedData));
		} else {
			// If there is no existing data, create a new array with the bond and quantity
			localStorage.setItem("BONDSECIDS", JSON.stringify([{ SECID: secid, quantity }]));
		}

		setIsListVisible(false);
		setSearchTerm("");
		setBonds((prev) => [...prev, bondWithQuantity]);
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
		<div className="flex flex-col space-y-4 w-full max-w-md mx-auto p-4">
			<div
				className="relative"
				ref={dropdownRef}
			>
				<div className="relative flex items-center cursor-pointer border border-gray-300 rounded-md shadow-sm">
					<input
						type="text"
						value={searchTerm}
						onChange={handleInputChange}
						placeholder="Поиск облигаций..."
						className="w-full p-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						aria-label="Search bonds"
						onClick={(e) => e.stopPropagation()}
						onFocus={() => setIsListVisible(true)}
					/>
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
					{isListVisible ? (
						<ChevronUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
					) : (
						<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
					)}
				</div>
				{isListVisible && filteredOptions.length > 0 && (
					<ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
						{filteredOptions.map((bond, index) => (
							<li
								key={index}
								onClick={() => handleSelect(bond.SECID)}
								className="p-2 hover:bg-gray-100 cursor-pointer"
							>
								{bond.SHORTNAME}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default SelectList;
