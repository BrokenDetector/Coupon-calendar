import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import YandexProvider from "next-auth/providers/yandex";
import { db } from "./db";
import { LoginSchema } from "./validations/schemas";

function getGoogleCredentials() {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

	if (!clientId || clientId.length === 0) {
		throw new Error("Missing GOOGLE_CLIENT_ID");
	}

	if (!clientSecret || clientSecret.length === 0) {
		throw new Error("Missing GOOGLE_CLIENT_SECRET");
	}

	return { clientId, clientSecret };
}

function getYandexCredentials() {
	const clientId = process.env.YANDEX_CLIENT_ID;
	const clientSecret = process.env.YANDEX_CLIENT_SECRET;

	if (!clientId || clientId.length === 0) {
		throw new Error("Missing YANDEX_CLIENT_ID");
	}

	if (!clientSecret || clientSecret.length === 0) {
		throw new Error("Missing YANDEX_CLIENT_SECRET");
	}

	return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db) as Adapter,
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/auth",
		error: "/auth",
	},
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GoogleProvider({
			clientId: getGoogleCredentials().clientId,
			clientSecret: getGoogleCredentials().clientSecret,
		}),
		YandexProvider({
			clientId: getYandexCredentials().clientId,
			clientSecret: getYandexCredentials().clientSecret,
		}),
		Credentials({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email", placeholder: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const validatedFields = LoginSchema.safeParse(credentials);
				if (validatedFields.success) {
					const { email, password } = validatedFields.data;

					const existingId = (await db.get(`user:email:${email}`)) as string | null;

					if (existingId) {
						const user = (await db.get(`user:${existingId}`)) as User | null;
						if (!user) return null;

						if (!user.password) {
							throw new Error(
								"This email is associated with a Google or Yandex account. Please sign in with the appropriate provider."
							);
						}

						const passwordsMatch = await bcrypt.compare(password, user.password);
						if (passwordsMatch) {
							return user;
						}
					}
				}
				return null;
			},
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider !== "credentials") {
				const existingId = ((await db.get(`user:email:${user.email}`)) as User) || null;

				// If this is a new user
				if (!existingId) {
					user.portfolios = [
						{
							id: "1",
							name: "Портфель 1",
							bonds: [],
						},
					];
				}
				if (existingId) {
					const existingUser = (await db.get(`user:${existingId}`)) as User;
					if (existingUser?.password) {
						throw new Error("EmailInUse");
					}
				}
			}
			return true;
		},
		async jwt({ token, user, account }) {
			const dbUser = (await db.get(`user:${token.id}`)) as User;

			if (!dbUser && user) {
				token.id = user.id;
				token.isVerified = !!account?.provider;
				return token;
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
				isVerified: dbUser.isVerified,
			};
		},

		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.picture;
				session.user.isVerified = token.isVerified;
			}

			return session;
		},
	},
};
