import Link from "next/link";
import { DataTable } from "./BondTable/DataTable";
import { columns } from "./BondTable/PortfolioColumns";
import SelectList from "./SelectList";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MyBondsCardProps {
	bonds: Bond[];
	allBonds: MOEXBondData[];
	handleQuantityChange: (secId: string, value: number) => void;
	handlePriceChange: (secId: string, price: number) => void;
	handlePriceBlur: (bond: Bond, newPrice: number) => void;
	handleBondAdd: (bond: Bond) => void;
	handleBondRemove: (secId: string) => void;
}

const MyBondsCard = ({
	bonds,
	allBonds,
	handleBondRemove,
	handlePriceBlur,
	handleBondAdd,
	handleQuantityChange,
	handlePriceChange,
}: MyBondsCardProps) => {
	const tableData = bonds.map((bond: Bond) => ({
		...bond,
		handleBondRemove,
		handlePriceBlur,
		handleQuantityBlur: handleBondAdd,
		handleQuantityChange,
		handlePriceChange,
	}));

	return (
		<Card className="rounded-lg col-span-4 xl:col-span-3">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-2xl font-bold">Мои облигации</CardTitle>
				<div>
					<Button
						variant="link"
						asChild
						className="ml-4 text-foreground text-sm p-0"
					>
						<Link href="/bonds">Список всех облигаций</Link>
					</Button>
					<SelectList
						options={allBonds}
						onBondUpdate={handleBondAdd}
						bonds={bonds}
					/>
				</div>
			</CardHeader>
			<CardContent>
				<DataTable
					data={tableData}
					columns={columns}
					className="h-[320px]"
				/>
			</CardContent>
		</Card>
	);
};

export default MyBondsCard;
