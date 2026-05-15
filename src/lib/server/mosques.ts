import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db } from "#/lib/db.ts";
import { mosques, mosquePhotos } from "#/db/schema.ts";
import { calculateDistance } from "#/utils/distance.ts";
import { sql } from "drizzle-orm";
import { auth } from "#/lib/auth.ts";

export const getNearbyMosques = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: { lat: number; lng: number; radius?: number }) => data,
	)
	.handler(async ({ data }) => {
		const { lat, lng, radius = 10 } = data;

		const rows = await db.select().from(mosques);

		const withDistance = rows
			.map((row) => ({
				id: row.id,
				name: row.name,
				latitude: row.latitude,
				longitude: row.longitude,
				address: row.address,
				website: row.website,
				contact: row.contact,
				type: row.type,
				hasWuduArea: row.hasWuduArea,
				hasSeparateMenWomen: row.hasSeparateMenWomen,
				hasParking: row.hasParking,
				isWheelchairAccessible: row.isWheelchairAccessible,
				hasRestrooms: row.hasRestrooms,
				distance: calculateDistance(lat, lng, row.latitude, row.longitude),
			}))
			.filter((m) => m.distance <= radius)
			.sort((a, b) => a.distance - b.distance);

		return withDistance;
	});

export const getMosqueDetails = createServerFn({
	method: "GET",
})
	.inputValidator((data: { mosqueId: string }) => data)
	.handler(async ({ data }) => {
		const { mosqueId } = data;

		const [mosque] = await db
			.select()
			.from(mosques)
			.where(sql`${mosques.id} = ${mosqueId}` as any);

		if (!mosque) {
			return null;
		}

		const photos = await db
			.select({ url: mosquePhotos.url })
			.from(mosquePhotos)
			.where(sql`${mosquePhotos.mosqueId} = ${mosqueId}` as any);

		return {
			id: mosque.id,
			name: mosque.name,
			latitude: mosque.latitude,
			longitude: mosque.longitude,
			address: mosque.address,
			website: mosque.website,
			contact: mosque.contact,
			type: mosque.type,
			hasWuduArea: mosque.hasWuduArea,
			hasSeparateMenWomen: mosque.hasSeparateMenWomen,
			hasParking: mosque.hasParking,
			isWheelchairAccessible: mosque.isWheelchairAccessible,
			hasRestrooms: mosque.hasRestrooms,
			photos: photos.map((p) => p.url),
		};
	});

export const createMosque = createServerFn({
	method: "POST",
})
	.inputValidator(
		(
			data: {
				name: string;
				type: string;
				latitude: number;
				longitude: number;
				address?: string;
				website?: string;
				contact?: string;
				hasWuduArea?: boolean;
				hasSeparateMenWomen?: boolean;
				hasParking?: boolean;
				isWheelchairAccessible?: boolean;
				hasRestrooms?: boolean;
			},
		) => data,
	)
	.handler(async ({ data }) => {
		const request = getRequest();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const [row] = await db
			.insert(mosques)
			.values({
				name: data.name,
				type: data.type,
				latitude: data.latitude,
				longitude: data.longitude,
				address: data.address ?? null,
				website: data.website ?? null,
				contact: data.contact ?? null,
				hasWuduArea: data.hasWuduArea ?? false,
				hasSeparateMenWomen: data.hasSeparateMenWomen ?? false,
				hasParking: data.hasParking ?? false,
				isWheelchairAccessible: data.isWheelchairAccessible ?? false,
				hasRestrooms: data.hasRestrooms ?? false,
				createdById: session.user.id,
			})
			.returning();

		return row;
	});
