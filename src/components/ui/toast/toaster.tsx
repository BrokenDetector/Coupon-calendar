"use client";

import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
	useToast,
} from "@/components/ui/toast";

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts
				.slice()
				.reverse()
				.map(function ({ id, title, description, action, icon, ...props }) {
					return (
						<Toast
							key={id}
							{...props}
						>
							<div className="flex gap-3">
								{icon && <div className="flex-shrink-0">{icon}</div>}
								<div className="grid gap-1">
									{title && <ToastTitle>{title}</ToastTitle>}
									{description && <ToastDescription>{description}</ToastDescription>}
								</div>
							</div>
							{action}
							<ToastClose />
						</Toast>
					);
				})}
			<ToastViewport />
		</ToastProvider>
	);
}
