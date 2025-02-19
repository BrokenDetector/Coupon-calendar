import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const page = () => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
			<div className="container mx-auto flex max-w-md flex-col items-center px-4 py-8 text-center">
				<AlertTriangle className="h-16 w-16 text-yellow-500" />
				<h1 className="mt-6 text-3xl font-bold">Слишком много запросов</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					Извините, вы отправили слишком много запросов. Пожалуйста, подождите немного и попробуйте снова.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">Код ошибки: 429</p>
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

export default page;
