import { createServerFn } from "@tanstack/react-start";
import { db } from "#/lib/db.ts";
import { mosques } from "#/db/schema.ts";
import { calculateDistance } from "#/utils/distance.ts";

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
