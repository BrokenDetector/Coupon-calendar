"use client";
import { BondProvider } from "@/hooks/useBondContext";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
	children: ReactNode;
}

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
	return (
		<>
			<Toaster
				position="top-center"
				reverseOrder={false}
			/>
			<SessionProvider>
				<BondProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
					>
						{children}
					</ThemeProvider>
				</BondProvider>
			</SessionProvider>
		</>
	);
};

export default Providers;
