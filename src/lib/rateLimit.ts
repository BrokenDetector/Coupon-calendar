import { db } from "@/lib/db";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = {
	authorized: new Ratelimit({
		redis: db,
		limiter: Ratelimit.fixedWindow(100, "5 m"),
		analytics: true,
		prefix: "ratelimit:auth",
	}),
	notAuthorized: new Ratelimit({
		redis: db,
		limiter: Ratelimit.fixedWindow(50, "5 m"),
		analytics: true,
		prefix: "ratelimit:notauth",
	}),
};

export const isLimited = async (identifier: string, isLoggedIn?: boolean) => {
	const { success } = isLoggedIn
		? await ratelimit.authorized.limit(identifier)
		: await ratelimit.notAuthorized.limit(identifier);

	if (success) {
		return true;
	} else {
		return false;
	}
};
