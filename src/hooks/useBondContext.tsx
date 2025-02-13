"use client";

import { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useState } from "react";

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
