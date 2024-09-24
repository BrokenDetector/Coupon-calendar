import { Bond } from "@/types/bond";
import { Redis } from "@upstash/redis";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
});

const CACHE_DURATION = 1 * 60 * 60; // 1 hours in seconds

export const getCachedBonds = async (): Promise<Bond[] | null> => {
	const cachedData = await redis.get<Bond[]>("bondsCache");
	if (cachedData) {
		return cachedData;
	}
	return null;
};

export const cacheBonds = async (bonds: Bond[]): Promise<void> => {
	await redis.set("bondsCache", bonds, { ex: CACHE_DURATION });
};
