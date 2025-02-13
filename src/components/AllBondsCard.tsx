import { FC } from "react";
import { columns } from "./BondTable/AllBondsColumns";
import { DataTable } from "./BondTable/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AllBondsCardProps {
	allBonds: MOEXBondData[];
}

const AllBondsCard: FC<AllBondsCardProps> = ({ allBonds }) => {
	return (
		<div className="flex justify-center">
			<Card className="rounded-lg w-[600px] md:w-[800px] lg:w-[1000px] xl:w-[1200px]">
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
		</div>
	);
};

export default AllBondsCard;
