import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
	const session = await getToken({ req });
	const pathname = req.nextUrl.pathname;

	if (!session && pathname.startsWith("/portfolio")) {
		return NextResponse.redirect(new URL("/auth", req.url));
	}

	if (session && (pathname.startsWith("/auth") || pathname === "/")) {
		return NextResponse.redirect(new URL("/portfolio", req.url));
	}

	// Public routes that don't need session checks
	if (pathname === "/" || pathname === "/bonds") {
		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/portfolio/:path*", "/auth/:path*", "/"],
};
