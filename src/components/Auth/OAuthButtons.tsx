"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { FC, useState } from "react";
import toast from "react-hot-toast";

export const OAuthButtons: FC = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleOAuthSignIn = async (provider: "google" | "yandex") => {
		try {
			setIsLoading(true);
			const result = await signIn(provider, { redirect: false });

			if (result?.error) {
				console.log(result.error);
				toast.error("Произошла ошибка при входе");
			}
		} catch (error) {
			toast.error("Произошла ошибка при входе");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-row items-center justify-between gap-3 w-full">
			<Button
				variant="outline"
				onClick={() => handleOAuthSignIn("google")}
				disabled={isLoading}
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
				disabled={isLoading}
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
