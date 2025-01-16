import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import YandexProvider from "next-auth/providers/yandex";
import { db } from "./db";
import { getUserByEmail } from "./db-helpers";
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

const prismaAdapter = PrismaAdapter(db) as Adapter;

//@ts-ignore
prismaAdapter.createUser = async (data) => {
	const isOAuthUser = !!data.emailVerified;

	const user = await db.user.create({
		data: {
			name: data.name,
			email: data.email,
			image: data.image,
			emailVerified: isOAuthUser ? true : false,
			portfolios: {
				create: {
					name: "Портфель 1",
					bonds: { create: [] },
				},
			},
		},
	});

	return user;
};

export const authOptions: NextAuthOptions = {
	adapter: prismaAdapter,
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/auth",
		error: "/auth",
	},
	providers: [
		GoogleProvider({
			clientId: getGoogleCredentials().clientId,
			clientSecret: getGoogleCredentials().clientSecret,
		}),
		YandexProvider({
			clientId: getYandexCredentials().clientId,
			clientSecret: getYandexCredentials().clientSecret,
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const validatedFields = LoginSchema.safeParse(credentials);
				if (validatedFields.success) {
					const { email, password } = validatedFields.data;

					const existingUser = (await getUserByEmail(email)) as User;

					if (existingUser) {
						if (!existingUser) return null;

						if (!existingUser.password) {
							throw new Error(
								"This email is associated with a Google or Yandex account. Please sign in with the appropriate provider."
							);
						}

						const passwordsMatch = await compare(password, existingUser.password);
						if (passwordsMatch) {
							return existingUser;
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
				const existingUser = await getUserByEmail(user.email!);

				if (existingUser?.password) {
					throw new Error("EmailInUse");
				}
			}
			return true;
		},
		async jwt({ token, user, account }) {
			const dbUser = await getUserByEmail(token.email!);

			if (!dbUser) {
				if (user) {
					token.id = user.id;
					token.emailVerified = !!account?.provider;
				}
				return token;
			}

			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
				emailVerified: dbUser.emailVerified || false,
			};
		},
		async session({ session, token }) {
			if (token) {
				const dbUser = await getUserByEmail(session.user.email!);

				session.user.id = token.id;
				session.user.name = token.name!;
				session.user.email = token.email;
				session.user.image = token.picture;
				session.user.emailVerified = token.emailVerified || false;
				// @ts-ignore
				session.user.portfolios = dbUser?.portfolios || [];
			}
			return session;
		},
	},
};
