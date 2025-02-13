import { authOptions } from "@/lib/auth";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

export async function checkProtection(requireAuth = false) {
	try {
		const [session, headersList] = await Promise.all([
			requireAuth ? getServerSession(authOptions) : null,
			headers(),
		]);

		// (middleware should catch this first, this is a backup)
		if (requireAuth && !session?.user) {
			return { error: "Неавторизован." };
		}

		const ip = headersList.get("x-real-ip") || headersList.get("x-forwarded-for");
		const isAllowed = await isLimited(ip as string, requireAuth);

		if (!isAllowed) {
			return { error: "Слишком много запросов, попробуйте позже." };
		}

		return { success: true, session };
	} catch (error) {
		console.error("Protection check error:", error);
		return { error: "Ошибка проверки доступа." };
	}
}
