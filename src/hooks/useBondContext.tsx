"use client";

import { getBaseUrl } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";

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
	const { getLocalData } = useLocalStorage("BONDSECIDS");

	useEffect(() => {
		const fetchData = async () => {
			if (pathname === "/") {
				const bondSecids = getLocalData();
				const limitedBondSecids = bondSecids.slice(0, 10);

				if (limitedBondSecids.length > 0) {
					const toastId = toast.loading("Загрузка облигаций...");

					try {
						const res = await fetch(getBaseUrl("/api/fetch-bonds"), {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								bonds: limitedBondSecids,
								fetchCoupons: true,
							}),
						});

						if (!res.ok) {
							throw new Error(`status: ${res.status}`);
						}
						const bondsList = await res.json();
						setBonds(bondsList);
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
	}, [pathname, getLocalData]);

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
