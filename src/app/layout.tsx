import Header from "@/components/Header/Header";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["cyrillic"], preload: true });

export const metadata: Metadata = {
	title: "Купоны Облигаций — Отслеживание выплат по облигациям",
	description: "Сервис для отслеживания купонов облигаций с Московской биржи",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="ru"
			suppressHydrationWarning
		>
			<body className={cn("min-h-screen min-w-[500px] flex flex-col justify-between", inter.className)}>
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
			<GoogleAnalytics gaId="G-CGKKZ2R2XG" />
		</html>
	);
}
