"use client";

import { fetchBondCoupons } from "@/actions/fetch-bond";
import { usePathname } from "next/navigation";
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface BondContextProps {
	bonds: Bond[];
	setBonds: Dispatch<SetStateAction<Bond[]>>;
}

interface BondProviderProps {
	children: ReactNode;
}

const BondContext = createContext<BondContextProps | undefined>(undefined);

export const BondProvider: FC<BondProviderProps> = ({ children }) => {
	const [bonds, setBonds] = useState<Bond[]>([]);
	const pathname = usePathname();

	useEffect(() => {
		const fetchData = async () => {
			const bondSecids = localStorage.getItem("BONDSECIDS");
			if (bondSecids) {
				const bondStorage: Bondsecid[] = JSON.parse(bondSecids);
				if (pathname === "/") {
					const toastId = toast.loading("Загрузка облигаций...");

					try {
						for (const bond of bondStorage) {
							const bondData = await fetchBondCoupons(bond.SECID);
							setBonds((prevBonds) => [...prevBonds, { ...bondData, quantity: bond.quantity || 1 }]);
						}

						toast.success("Облигации загружены");
					} catch (error) {
						console.error(`❗Error fetching bonds`, error);
						toast.error("Не удалось загрузить облигации");
					} finally {
						toast.dismiss(toastId);
					}
				}
			}
		};

		fetchData();
	}, [pathname]);

	return <BondContext.Provider value={{ bonds, setBonds }}>{children}</BondContext.Provider>;
};

// Custom hook to use the bond context
export const useBonds = () => {
	const context = useContext(BondContext);
	if (!context) {
		throw new Error("useBonds must be used within a BondProvider");
	}
	return context;
};
