import { toast } from "@/components/ui/toast/use-toast";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const customToast = {
	success: (message: string) =>
		toast({
			variant: "default",
			title: message,
			icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
			className: "border-emerald-500 dark:border-emerald-400",
		}),

	error: (message: string) =>
		toast({
			variant: "destructive",
			title: message,
			icon: <AlertCircle className="h-5 w-5" />,
			duration: 5000,
		}),

	loading: (message: string) =>
		toast({
			variant: "default",
			title: message,
			icon: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
			className: "border-primary",
		}),

	promise: async <T,>(
		promise: Promise<T>,
		{ loading = "Загрузка...", success = "Готово!", error = "Произошла ошибка" } = {}
	) => {
		const { dismiss } = customToast.loading(loading);

		try {
			const data = await promise;
			dismiss();
			customToast.success(success);
			return data;
		} catch (err) {
			dismiss();
			customToast.error(error);
			throw err;
		}
	},
};
