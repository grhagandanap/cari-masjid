export interface OsrmStep {
	distance: number;
	duration: number;
	name: string;
	maneuver: {
		type: string;
		modifier?: string;
	};
}

export interface DirectionsResult {
	distance: number;
	duration: number;
	coordinates: [number, number][];
	steps: OsrmStep[];
}

export type TravelMode = "driving" | "walking";

export async function fetchRoute(
	origin: [number, number],
	destination: [number, number],
	mode: TravelMode = "driving",
): Promise<DirectionsResult> {
	const profile = mode === "walking" ? "foot" : "driving";
	const url =
		`https://router.project-osrm.org/route/v1/${profile}/` +
		`${origin[1]},${origin[0]};${destination[1]},${destination[0]}` +
		`?steps=true&geometries=geojson&overview=full`;

	const res = await fetch(url);
	if (!res.ok) throw new Error("Failed to fetch route from OSRM");

	const data = await res.json();
	if (data.code !== "Ok" || !data.routes?.[0]) {
		throw new Error("No route found between these locations");
	}

	const route = data.routes[0];
	return {
		distance: route.distance,
		duration: route.duration,
		coordinates: (route.geometry.coordinates as [number, number][]).map(
			([lng, lat]) => [lat, lng],
		),
		steps: route.legs[0]?.steps ?? [],
	};
}

export function formatDistance(meters: number): string {
	if (meters < 1000) return `${Math.round(meters)} m`;
	return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
	const mins = Math.round(seconds / 60);
	if (mins < 60) return `${mins} min`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function getStepInstruction(step: OsrmStep): string {
	const { type, modifier } = step.maneuver;
	const onto = step.name ? ` ke ${step.name}` : "";

	if (type === "depart") return `Mulai perjalanan${onto}`;
	if (type === "arrive") return "Tiba di tujuan";
	if (type === "continue" || type === "new name") return `Lanjutkan${onto}`;
	if (type === "merge") return `Gabung${onto}`;
	if (type === "roundabout" || type === "rotary") return "Masuk bundaran";
	if (type === "exit roundabout" || type === "exit rotary")
		return `Keluar bundaran${onto}`;
	if (type === "fork") return `Tetap ${modifier ?? "lurus"} di persimpangan`;
	if (type === "on ramp") return `Ambil jalur${onto}`;
	if (type === "off ramp") return `Ambil jalan keluar${onto}`;

	if (type === "turn") {
		const dir =
			modifier === "uturn"
				? "Putar balik"
				: modifier === "sharp left"
					? "Belok tajam kiri"
					: modifier === "left"
						? "Belok kiri"
						: modifier === "slight left"
							? "Sedikit ke kiri"
							: modifier === "straight"
								? "Lurus"
								: modifier === "slight right"
									? "Sedikit ke kanan"
									: modifier === "right"
										? "Belok kanan"
										: modifier === "sharp right"
											? "Belok tajam kanan"
											: "Lanjutkan";
		return `${dir}${onto}`;
	}

	return `Lanjutkan${onto}`;
}

export function lngLatToPixel(
	lat: number,
	lng: number,
	center: [number, number],
	zoom: number,
	width: number,
	height: number,
): [number, number] {
	const TILE = 256;
	const scale = Math.pow(2, zoom);

	const wx = (l: number) => ((l + 180) / 360) * TILE * scale;
	const wy = (l: number) => {
		const r = (l * Math.PI) / 180;
		return (
			((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) *
			TILE *
			scale
		);
	};

	return [
		wx(lng) - wx(center[1]) + width / 2,
		wy(lat) - wy(center[0]) + height / 2,
	];
}

export function routeBounds(coords: [number, number][]): {
	center: [number, number];
	zoom: number;
} {
	if (coords.length === 0) return { center: [0, 0], zoom: 13 };
	const lats = coords.map(([lat]) => lat);
	const lngs = coords.map(([, lng]) => lng);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);
	const center: [number, number] = [
		(minLat + maxLat) / 2,
		(minLng + maxLng) / 2,
	];
	const span = Math.max(maxLat - minLat, maxLng - minLng);
	const zoom = Math.max(Math.min(Math.floor(Math.log2(360 / span)) - 1, 16), 8);
	return { center, zoom };
}
