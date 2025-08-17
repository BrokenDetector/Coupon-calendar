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
		<Card className="col-span-5 rounded-lg xl:col-span-4">
			<CardHeader className="flex flex-col justify-between sm:flex-row sm:items-center">
				<CardTitle className="text-xl font-bold">Мои облигации</CardTitle>
				<div>
					<SelectList
						options={allBonds}
						onBondUpdate={handleBondAdd}
						bonds={bonds}
					/>
					<Button
						variant="link"
						asChild
						className="p-0 ml-4 text-xs text-foreground"
					>
						<Link href="/bonds">Список всех облигаций</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<DataTable
					data={tableData}
					columns={columns}
					className="h-[320px]"
					placeholder="Поиск по портфелю"
				/>
			</CardContent>
		</Card>
	);
};

export default MyBondsCard;
