import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
	const session = await getToken({ req });

	if (!session && req.nextUrl.pathname.startsWith("/portfolio")) {
		return NextResponse.redirect(new URL("/auth", req.url));
	}

	if (session && (req.nextUrl.pathname.startsWith("/auth") || req.nextUrl.pathname === "/")) {
		return NextResponse.redirect(new URL("/portfolio/1", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/portfolio/:path*", "/auth/:path*", "/"],
};
