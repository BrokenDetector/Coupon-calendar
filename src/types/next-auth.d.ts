import "next-auth";
import "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
	interface JWT {
		id: UserId;
		emailVerified: boolean;
	}
}

declare module "next-auth" {
	interface User {
		emailVerified?: boolean;
		verificationToken?: string;
		verificationTokenExpires?: Date;
		resetPasswordToken?: string;
		resetPasswordTokenExpires?: Date;
		portfolios: Portfolio[];
	}

	interface Session {
		user: User & {
			id: UserId;
			name: string;
			emailVerified?: boolean;
			portfolios: Portfolio[];
		};
	}
}
