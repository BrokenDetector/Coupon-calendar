import Providers from "@/components/Providers";
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
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
			<GoogleAnalytics gaId="G-CGKKZ2R2XG" />
		</html>
	);
}
