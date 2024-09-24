import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Купоны Облигаций — Календарь выплат на МосБирже",
	description:
		"Сервис для отслеживания купонов облигаций с Московской биржи. Удобный календарь показывает даты выплат и сумму купонов за день и месяц.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
