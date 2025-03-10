import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const NotFound = () => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
			<div className="container mx-auto flex max-w-md flex-col items-center px-4 py-8 text-center">
				<FileQuestion className="h-16 w-16 text-muted-foreground" />
				<h1 className="mt-6 text-3xl font-bold">404 - Страница не найдена</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					Извините, запрашиваемая вами страница не существует.
				</p>
				<Button
					asChild
					className="mt-6"
				>
					<Link href="/">Вернуться на главную</Link>
				</Button>
			</div>
		</div>
	);
};

export default NotFound;
