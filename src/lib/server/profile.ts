import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db } from "#/lib/db.ts";
import { user, mosques } from "#/db/schema.ts";
import { auth } from "#/lib/auth.ts";
import { sql } from "drizzle-orm";

export const getUserProfile = createServerFn({
	method: "GET",
})
	.handler(async () => {
		const request = getRequest();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const userId = session.user.id;

		const [profile] = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				address: user.address,
				phone: user.phone,
			})
			.from(user)
			.where(sql`${user.id} = ${userId}` as any)
			.limit(1);

		const userMosques = await db
			.select({ id: mosques.id })
			.from(mosques)
			.where(sql`${mosques.createdById} = ${userId}` as any);

		return {
			...profile,
			contributions: userMosques.length,
		};
	});

export const updateUserProfile = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			name: string;
			address?: string | null;
			phone?: string | null;
		}) => data,
	)
	.handler(async ({ data }) => {
		const request = getRequest();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const userId = session.user.id;

		await db
			.update(user)
			.set({
				name: data.name,
				address: data.address ?? null,
				phone: data.phone ?? null,
				updatedAt: new Date(),
			})
			.where(sql`${user.id} = ${userId}` as any);

		return { success: true };
	});
