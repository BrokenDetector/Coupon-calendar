"use client";

import { Button } from "@/components/ui/button";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useTransition } from "react";
import { customToast } from "../ui/toast/toast-variants";

export const OAuthButtons: FC = () => {
	const [isPending, startPending] = useTransition();
	const router = useRouter();

	const handleOAuthSignIn = async (provider: "google" | "yandex") => {
		startPending(async () => {
			const res = await signIn(provider, { redirect: false });

			if (!res?.error) {
				const session = await getSession();
				router.push(`/portfolio/${session?.user.portfolios?.[0]?.id}`);
			} else {
				customToast.error("Произошла ошибка при входе");
			}
		});
	};

	return (
		<div className="flex flex-row gap-3 justify-between items-center">
			<Button
				variant="outline"
				onClick={() => handleOAuthSignIn("google")}
				disabled={isPending}
				className="w-full"
			>
				<Image
					src="/google.svg"
					alt="Google"
					width={25}
					height={25}
				/>
			</Button>

			<Button
				variant="outline"
				onClick={() => handleOAuthSignIn("yandex")}
				disabled={isPending}
				className="w-full"
			>
				<Image
					src="/yandex.svg"
					alt="Yandex"
					width={30}
					height={30}
				/>
			</Button>
		</div>
	);
};

export default OAuthButtons;
