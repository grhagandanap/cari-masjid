import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/hooks/use-auth.ts";
import { useGeolocation } from "#/hooks/use-geolocation.ts";
import { getNearbyMosques } from "#/lib/server/mosques.ts";
import { MosqueCard } from "#/components/MosqueCard.tsx";
import { Button } from "#/components/ui/button.tsx";

export const Route = createFileRoute("/")({
	component: Home,
});

interface NearbyMosque {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	address: string | null;
	website: string | null;
	contact: string | null;
	type: string;
	hasWuduArea: boolean;
	hasSeparateMenWomen: boolean;
	hasParking: boolean;
	isWheelchairAccessible: boolean;
	hasRestrooms: boolean;
	distance: number;
}

function Home() {
	const { user, isPending } = useAuth();
	const isAuthenticated = !!user;
	const { location, error: geoError, isLoading: geoLoading } = useGeolocation();
	const [mosques, setMosques] = useState<NearbyMosque[]>([]);
	const [loading, setLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		if (location) {
			setLoading(true);
			setFetchError(null);
			getNearbyMosques({
				lat: location.lat,
				lng: location.lng,
			})
				.then((data) => setMosques(data))
				.catch(() => setFetchError("Failed to load nearby mosques."))
				.finally(() => setLoading(false));
		}
	}, [location]);

	function requestLocation() {
		if (!("geolocation" in navigator)) return;
		navigator.geolocation.getCurrentPosition(() => {
			window.location.reload();
		});
	}

	return (
		<div className="flex flex-col px-4 py-12">
			{/* Hero */}
			<div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
				<h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
					Find Nearby Mosques Easily
				</h1>
				<p className="mt-6 max-w-2xl text-xl text-muted-foreground">
					Discover mosques around you, check available facilities, get directions,
					and contribute by adding new ones to help the community.
				</p>

				{isPending ? (
					<div className="mt-10 h-10 w-32 animate-pulse rounded-md bg-muted" />
				) : !isAuthenticated ? (
					<div className="mt-10 flex flex-col gap-3 sm:flex-row">
						<Button asChild size="lg">
							<Link to="/auth/login" search={{ redirect: undefined }}>Login</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link to="/auth/register">Register</Link>
						</Button>
					</div>
				) : null}
			</div>

			{/* Discovery Section */}
			<div className="mx-auto mt-12 w-full max-w-6xl">
				<h2 className="mb-6 text-2xl font-bold">Nearby Mosques</h2>

				{geoLoading ? (
					<div className="flex h-40 items-center justify-center">
						<p className="text-muted-foreground">Getting your location…</p>
					</div>
				) : geoError ? (
					<div className="flex h-40 flex-col items-center justify-center gap-4">
						<p className="text-muted-foreground">
							Location access is needed to find nearby mosques.
						</p>
						<Button onClick={requestLocation}>
							Allow Location Access to Find Mosques
						</Button>
					</div>
				) : loading ? (
					<div className="flex h-40 items-center justify-center">
						<p className="text-muted-foreground">Loading mosques…</p>
					</div>
				) : fetchError ? (
					<div className="flex h-40 items-center justify-center">
						<p className="text-destructive">{fetchError}</p>
					</div>
				) : mosques.length === 0 ? (
					<div className="flex h-40 items-center justify-center">
						<p className="text-muted-foreground">
							No mosques found nearby. Be the first to add one!
						</p>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{mosques.map((m) => (
							<MosqueCard
								key={m.id}
								id={m.id}
								name={m.name}
								distance={m.distance}
								facilities={{
									hasWuduArea: m.hasWuduArea,
									hasSeparateMenWomen: m.hasSeparateMenWomen,
									hasParking: m.hasParking,
									isWheelchairAccessible: m.isWheelchairAccessible,
									hasRestrooms: m.hasRestrooms,
								}}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
