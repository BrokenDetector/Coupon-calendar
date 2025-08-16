import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
	"https://coupon-calendar.vercel.app",
	"https://coupon-calendar-git-dev-detectors-projects.vercel.app",
	"http://localhost:3000",
];

const corsOptions = {
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(req: NextRequest) {
	const session = await getToken({ req });
	const pathname = req.nextUrl.pathname;

	// Check the origin from the request
	const origin = req.headers.get("origin") ?? "";
	const isAllowedOrigin = allowedOrigins.includes(origin);

	// Handle preflighted requests
	const isPreflight = req.method === "OPTIONS";

	if (isPreflight) {
		const preflightHeaders = {
			...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
			...corsOptions,
		};
		return NextResponse.json({}, { headers: preflightHeaders });
	}

	if (!session && pathname.startsWith("/portfolio")) {
		return NextResponse.redirect(new URL("/auth", req.url));
	}

	if (session && (pathname.startsWith("/auth") || pathname === "/")) {
		return NextResponse.redirect(new URL(`/portfolio/${session.portfolios[0].id}`, req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/portfolio/:path*", "/auth/:path*", "/"],
};
