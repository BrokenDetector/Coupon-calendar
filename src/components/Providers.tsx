"use client";
import { Toaster } from "@/components/ui/toast/toaster";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { FC, ReactNode } from "react";

interface ProvidersProps {
	children: ReactNode;
}

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
	return (
		<SessionProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
			>
				{children}
				<Toaster />
			</ThemeProvider>
		</SessionProvider>
	);
};

export default Providers;
