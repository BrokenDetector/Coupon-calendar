import ChangeThemeButton from "@/components/ChangeThemeButton";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

const SkeletonHeader = () => {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
				<div className="flex flex-1 items-center justify-between">
					<div className="flex items-center gap-2">
						<Link
							href="/"
							className="flex items-center gap-2 hover:bg-transparent"
						>
							<Image
								src="/logo.svg"
								width={32}
								height={32}
								alt="Logo"
								className="dark:invert"
							/>
							<span className="hidden sm:inline-block font-bold">Купоны Облигаций</span>
						</Link>
					</div>

					<div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
						<ChangeThemeButton />
						<Skeleton className="h-10 w-[200px]" />
					</div>
					<div className="-mr-2 flex items-center sm:hidden">
						<Skeleton className="h-10 w-10" />
					</div>
				</div>
			</div>
		</header>
	);
};

export default SkeletonHeader;
