// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "./db";
// import * as schema from "../db/schema";

// export const auth = betterAuth({
// 	database: drizzleAdapter(db, {
// 		provider: "pg",
// 		schema: schema,
// 	}),
// 	emailAndPassword: {
// 		enabled: true,
// 	},
// });

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "./db";
import * as schema from "../db/schema";

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET!,
	baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	trustedOrigins: [
	  "https://carimasjid.web.id",
	  "https://cari-masjid.gg-project.workers.dev",
	  "http://localhost:3000",
	],
	database: drizzleAdapter(db, {
	  provider: "pg",
	  schema: schema,
	}),
	emailAndPassword: {
	  enabled: true,
	},
	plugins: [tanstackStartCookies()],
  });