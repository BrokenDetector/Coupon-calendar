import "next-auth";
import "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
	interface JWT {
		id: UserId;
		isVerified: boolean;
	}
}

declare module "next-auth" {
	interface User {
		isVerified: boolean;
		verificationToken?: string;
		verificationTokenExpires?: Date;
		resetPasswordToken?: string;
		resetPasswordTokenExpires?: Date;
		portfolios: Portfolio[];
	}

	interface Session {
		user: User & {
			id: UserId;
			isVerified: boolean;
		};
	}
}
