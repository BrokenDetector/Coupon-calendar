import SkeletonCalendar from "@/components/Skeletons/SkeletonCalendar";
import SkeletonDataTable from "@/components/Skeletons/SkeletonDataTable";
import SkeletonSummaryCard from "@/components/Skeletons/SkeletonSummaryCard";

export default function Loading() {
	return (
		<main className="min-h-screen min-w-[500px]">
			<div className="flex flex-col space-y-4 mx-10">
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
					<SkeletonSummaryCard />
					<SkeletonDataTable />
				</div>
				<SkeletonCalendar />
			</div>
		</main>
	);
}
