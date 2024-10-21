"use client";

import { LoaderCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const ChangeThemeButton = () => {
	const [mounted, setMounted] = useState(false);
	const { setTheme, resolvedTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <LoaderCircle className="animate-spin size-[1.3rem]" />;
	}

	if (resolvedTheme === "dark") {
		return (
			<Button
				variant="outline"
				onClick={() => setTheme("light")}
				className="rounded-full p-3"
			>
				<Sun className="size-[1.3rem]" />
			</Button>
		);
	}

	if (resolvedTheme === "light") {
		return (
			<Button
				variant="outline"
				onClick={() => setTheme("dark")}
				className="rounded-full p-3"
			>
				<Moon className="size-[1.3rem]" />
			</Button>
		);
	}
};

export default ChangeThemeButton;
