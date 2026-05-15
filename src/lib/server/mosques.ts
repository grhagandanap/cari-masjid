import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db } from "#/lib/db.ts";
import { mosques, mosquePhotos, user } from "#/db/schema.ts";
import { calculateDistance } from "#/utils/distance.ts";
import { sql } from "drizzle-orm";
import { auth } from "#/lib/auth.ts";
import { supabase } from "#/lib/supabase";

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
				hasWudhuArea: row.hasWudhuArea,
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
			hasWudhuArea: mosque.hasWudhuArea,
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
				hasWudhuArea?: boolean;
				hasSeparateMenWomen?: boolean;
				hasParking?: boolean;
				isWheelchairAccessible?: boolean;
				hasRestrooms?: boolean;
				photos?: string[];
			},
		) => data,
	)
	.handler(async ({ data }) => {
		console.log("[createMosque] handler started, data:", data);
		try {
			const request = getRequest();
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (!session?.user) {
				throw new Error("Unauthorized");
			}

			const userId = session.user.id;
			console.log("[createMosque] session userId:", userId);

			// Verify the user actually exists in the DB
			const [existingUser] = await db
				.select({ id: user.id })
				.from(user)
				.where(sql`${user.id} = ${userId}` as any)
				.limit(1);

			console.log("[createMosque] existingUser:", existingUser);

			if (!existingUser) {
				console.error(
					"[createMosque] User not found in DB. userId:",
					userId,
				);
				throw new Error(
					"Your account was not found in the database. Please log out and register again.",
				);
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
					hasWudhuArea: data.hasWudhuArea ?? false,
					hasSeparateMenWomen: data.hasSeparateMenWomen ?? false,
					hasParking: data.hasParking ?? false,
					isWheelchairAccessible: data.isWheelchairAccessible ?? false,
					hasRestrooms: data.hasRestrooms ?? false,
					createdById: userId,
				})
				.returning();

			console.log("[createMosque] insert succeeded, row:", row);

			if (data.photos?.length) {
				const uploadedUrls = await Promise.all(
				  data.photos.map(async (dataUrl) => {
					const base64 = dataUrl.replace(/^data:.+;base64,/, '')
					const mimeMatch = dataUrl.match(/^data:(.+);base64,/)
					const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
					const ext = mimeType.split('/')[1]
					const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
					const filename = `${row.id}/${crypto.randomUUID()}.${ext}`
			  
					const { error } = await supabase.storage
					  .from('mosque-photos')
					  .upload(filename, buffer, {
						contentType: mimeType,
						upsert: false,
					  })
			  
					if (error) throw new Error(`Upload failed: ${error.message}`)
			  
					const { data: { publicUrl } } = supabase.storage
					  .from('mosque-photos')
					  .getPublicUrl(filename)
			  
					return publicUrl
				  })
				)
			  
				await db.insert(mosquePhotos).values(
				  uploadedUrls.map((url) => ({
					mosqueId: row.id,
					url, // now a real https:// URL
					uploadedById: userId,
				  }))
				)
			  }

			return row;
		} catch (err: any) {
			console.error("[createMosque] DB error:", {
				message: err?.message,
				code: err?.code,
				detail: err?.detail,
				constraint: err?.constraint,
				table: err?.table,
			});
			throw err;
		}
	});
