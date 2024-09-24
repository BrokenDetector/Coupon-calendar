import { Bond } from "@/types/bond";
import { Redis } from "@upstash/redis";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
});

const CACHE_DURATION = 6 * 60 * 60; // 6 hours in seconds

export const getCachedBonds = async (): Promise<Bond[] | null> => {
	const cachedData = await redis.get<Bond[]>("bondsCache");
	if (cachedData) {
		try {
			// Attempt to parse the cached data as JSON
			return cachedData;
		} catch (error) {
			console.error("Error parsing cached data:", error);
			return null;
		}
	}
	return null;
};

export const cacheBonds = async (bonds: Bond[]): Promise<void> => {
	await redis.set("bondsCache", JSON.stringify(bonds), { ex: CACHE_DURATION });
};
