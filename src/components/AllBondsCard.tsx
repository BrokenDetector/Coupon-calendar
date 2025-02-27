import { FC } from "react";
import { columns } from "./BondTable/AllBondsColumns";
import { DataTable } from "./BondTable/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AllBondsCardProps {
	allBonds: MOEXBondData[];
}

const AllBondsCard: FC<AllBondsCardProps> = ({ allBonds }) => {
	return (
		<Card className="rounded-lg col-span-4 xl:col-span-3 w-full xl:w-fit">
			<CardHeader>
				<CardTitle className="text-2xl font-bold">Все облигации</CardTitle>
			</CardHeader>
			<CardContent className="max-h-[700px]">
				<DataTable
					columns={columns}
					data={allBonds}
					filterPlaceholder="Поиск"
					maxHeight={"max-h-[600px]"}
				/>
			</CardContent>
		</Card>
	);
};

export default AllBondsCard;
