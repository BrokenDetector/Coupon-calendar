import { authOptions } from "@/lib/auth";
import { isLimited } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function checkProtection(requireAuth = false) {
	let isAllowed = true;
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
		isAllowed = await isLimited(ip as string, requireAuth);

		return { success: true, session };
	} catch (error) {
		console.error("Protection check error:", error);
		return { error: "Ошибка проверки доступа." };
	} finally {
		// move it here because it was throwing error if not allowed instead of redirecting
		if (!isAllowed) {
			redirect("/too-many-requests");
		}
	}
}
