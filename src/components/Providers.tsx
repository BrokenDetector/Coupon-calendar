"use client";
import { BondProvider } from "@/context/BondContext";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
	children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
	return (
		<>
			<Toaster
				position="top-center"
				reverseOrder={false}
			/>
			<BondProvider>{children}</BondProvider>
		</>
	);
};

export default Providers;
