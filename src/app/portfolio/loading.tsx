import SkeletonCalendar from "@/components/Skeletons/SkeletonCalendar";
import SkeletonDataTable from "@/components/Skeletons/SkeletonDataTable";
import SkeletonHeader from "@/components/Skeletons/SkeletonHeader";
import SkeletonSummaryCard from "@/components/Skeletons/SkeletonSummaryCard";

export default function Loading() {
	return (
		<main className="flex min-h-screen flex-col items-center gap-3 min-w-[500px]">
			<SkeletonHeader />

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
