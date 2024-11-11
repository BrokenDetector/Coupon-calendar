import { db } from "@/lib/db";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
	redis: db,
	limiter: Ratelimit.fixedWindow(100, "5 m"),
	analytics: true,
	prefix: "@upstash/ratelimit",
});

export const isLimited = async (identifier: string) => {
	const { success } = await ratelimit.limit(identifier);

	if (success) {
		return true;
	} else {
		return false;
	}
};
