import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { fetchRedis } from "../helpers/redis";
import { db } from "./db";
import { LoginSchema } from "./validations/schemas";

export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db),
	session: {
		strategy: "jwt",
	},

	pages: {
		signIn: "/auth",
	},
	providers: [
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

					const existingId = (await fetchRedis("get", `user:email:${email}`)) as string | null;

					if (existingId) {
						const userResult = await fetchRedis("get", `user:${JSON.parse(existingId)}`);
						if (!userResult) return null;

						const user = JSON.parse(userResult);
						if (!user.password) return null;

						const passwordsMatch = await bcrypt.compare(password, user.password);
						if (passwordsMatch) {
							return {
								id: user.id,
								name: user.name,
								email: user.email,
								image: user.image || null,
							};
						}
					}
				}
				return null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			const userResult = await fetchRedis("get", `user:${token.id}`);

			if (!userResult && user) {
				token.id = user.id;
				return token;
			}

			const dbUser = JSON.parse(userResult);
			return {
				id: dbUser.id,
				name: dbUser.name,
				email: dbUser.email,
				picture: dbUser.image,
			};
		},

		async session({ session, token }) {
			if (token) {
				// Attach the necessary fields to the session object
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.picture;
			}

			return session;
		},
	},
};
