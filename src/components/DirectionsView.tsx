import { useState, useEffect, useRef, useCallback } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import {
	ArrowLeft,
	ArrowUp,
	Car,
	CornerUpLeft,
	CornerUpRight,
	CornerDownLeft,
	Footprints,
	Loader2,
	MapPin,
	Navigation,
	RefreshCw,
	ExternalLink,
} from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import { useGeolocation } from "#/hooks/use-geolocation.ts";
import {
	fetchRoute,
	formatDistance,
	formatDuration,
	getStepInstruction,
	lngLatToPixel,
	routeBounds,
	type DirectionsResult,
	type OsrmStep,
	type TravelMode,
} from "#/utils/osrm.ts";

interface DirectionsViewProps {
	mosqueName: string;
	mosqueAddress?: string | null;
	lat: number;
	lng: number;
	onClose: () => void;
}

function getManeuverIcon(type: string, modifier?: string) {
	if (type === "depart") return Navigation;
	if (type === "arrive") return MapPin;
	if (type === "roundabout" || type === "rotary") return RefreshCw;
	if (type === "exit roundabout" || type === "exit rotary") return RefreshCw;
	if (type === "turn" || type === "fork") {
		if (modifier === "uturn") return CornerDownLeft;
		if (modifier?.includes("left")) return CornerUpLeft;
		if (modifier?.includes("right")) return CornerUpRight;
	}
	return ArrowUp;
}

export function DirectionsView({
	mosqueName,
	mosqueAddress,
	lat,
	lng,
	onClose,
}: DirectionsViewProps) {
	const { location, isLoading: geoLoading } = useGeolocation();
	const [route, setRoute] = useState<DirectionsResult | null>(null);
	const [routeLoading, setRouteLoading] = useState(false);
	const [routeError, setRouteError] = useState<string | null>(null);
	const [mode, setMode] = useState<TravelMode>("driving");
	const [center, setCenter] = useState<[number, number]>([lat, lng]);
	const [zoom, setZoom] = useState(14);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const [mapSize, setMapSize] = useState({ w: 600, h: 480 });

	useEffect(() => {
		const el = mapContainerRef.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const r = entries[0].contentRect;
			setMapSize({ w: r.width, h: r.height });
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	useEffect(() => {
		if (!location) return;
		setRouteLoading(true);
		setRouteError(null);
		setRoute(null);
		fetchRoute([location.lat, location.lng], [lat, lng], mode)
			.then((r) => {
				setRoute(r);
				const { center: c, zoom: z } = routeBounds(r.coordinates);
				setCenter(c);
				setZoom(z);
			})
			.catch((e: Error) => setRouteError(e.message))
			.finally(() => setRouteLoading(false));
	}, [location, lat, lng, mode]);

	const toPixel = useCallback(
		(clat: number, clng: number): [number, number] =>
			lngLatToPixel(clat, clng, center, zoom, mapSize.w, mapSize.h),
		[center, zoom, mapSize],
	);

	const polylinePoints = route?.coordinates
		.map(([clat, clng]) => toPixel(clat, clng).join(","))
		.join(" ");

	const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col">
			{/* ── Header ─────────────────────────────────────────── */}
			<div className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
				<button
					type="button"
					onClick={onClose}
					className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
				>
					<ArrowLeft className="size-4" />
					Back
				</button>

				<div className="min-w-0 flex-1">
					<p className="truncate font-semibold leading-tight">{mosqueName}</p>
					{route ? (
						<p className="text-xs text-muted-foreground">
							{formatDistance(route.distance)} ·{" "}
							{formatDuration(route.duration)}
						</p>
					) : mosqueAddress ? (
						<p className="truncate text-xs text-muted-foreground">
							{mosqueAddress}
						</p>
					) : null}
				</div>

				{/* Mode toggle */}
				<div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
					<button
						type="button"
						onClick={() => setMode("driving")}
						className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
							mode === "driving"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Car className="size-3.5" />
						Drive
					</button>
					<button
						type="button"
						onClick={() => setMode("walking")}
						className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
							mode === "walking"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Footprints className="size-3.5" />
						Walk
					</button>
				</div>

				<a
					href={gmapsUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:flex"
				>
					<ExternalLink className="size-3.5" />
					Google Maps
				</a>
			</div>

			{/* ── Body ───────────────────────────────────────────── */}
			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				{/* Map */}
				<div
					ref={mapContainerRef}
					className="relative flex-1"
					style={{ minHeight: "45vh" }}
				>
					{geoLoading ? (
						<div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
							<Loader2 className="size-6 animate-spin" />
							<p className="text-sm">Getting your location…</p>
						</div>
					) : (
						<Map
							center={center}
							zoom={zoom}
							onBoundsChanged={({ center: c, zoom: z }) => {
								setCenter(c as [number, number]);
								setZoom(z);
							}}
						>
							{/* User location pulse */}
							{location ? (
								<Overlay
									anchor={[location.lat, location.lng]}
									offset={[12, 12]}
								>
									<div className="relative">
										<span className="absolute inset-0 size-6 animate-ping rounded-full bg-blue-500/40" />
										<span className="relative block size-6 rounded-full border-2 border-white bg-blue-500 shadow-md" />
									</div>
								</Overlay>
							) : null}

							{/* Mosque destination marker */}
							<Marker anchor={[lat, lng]} color="#0d9488" width={38} />
						</Map>
					)}

					{/* SVG polyline overlay */}
					{polylinePoints && (
						<div className="pointer-events-none absolute inset-0">
							<svg width="100%" height="100%">
								<polyline
									points={polylinePoints}
									fill="none"
									stroke="white"
									strokeWidth="7"
									strokeLinecap="round"
									strokeLinejoin="round"
									opacity="0.6"
								/>
								<polyline
									points={polylinePoints}
									fill="none"
									stroke="#3b82f6"
									strokeWidth="4"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					)}

					{/* Route loading overlay on the map */}
					{routeLoading && (
						<div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
							<Loader2 className="size-3.5 animate-spin" />
							Calculating…
						</div>
					)}
				</div>

				{/* Steps panel */}
				<aside className="flex w-full shrink-0 flex-col overflow-hidden border-t border-border lg:w-[360px] lg:border-l lg:border-t-0">
					{routeError ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
							<MapPin className="size-8 text-muted-foreground" />
							<p className="text-sm text-destructive">{routeError}</p>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									if (!location) return;
									setRouteLoading(true);
									setRouteError(null);
									fetchRoute([location.lat, location.lng], [lat, lng], mode)
										.then((r) => {
											setRoute(r);
											const { center: c, zoom: z } = routeBounds(r.coordinates);
											setCenter(c);
											setZoom(z);
										})
										.catch((e: Error) => setRouteError(e.message))
										.finally(() => setRouteLoading(false));
								}}
							>
								Retry
							</Button>
						</div>
					) : !location && !geoLoading ? (
						<div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
							<Navigation className="size-8 text-muted-foreground" />
							<p className="text-sm font-medium">Location access needed</p>
							<p className="text-xs text-muted-foreground">
								Allow location access to get directions.
							</p>
						</div>
					) : routeLoading || geoLoading ? (
						<StepsSkeleton />
					) : route ? (
						<>
							{/* Summary bar */}
							<div className="shrink-0 border-b border-border bg-gradient-to-r from-emerald-50/80 to-teal-50/80 px-4 py-3 dark:from-emerald-950/30 dark:to-teal-950/30">
								<div className="flex items-center gap-3">
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
										{mode === "driving" ? (
											<Car className="size-5" />
										) : (
											<Footprints className="size-5" />
										)}
									</div>
									<div>
										<p className="text-lg font-bold leading-tight">
											{formatDistance(route.distance)}
										</p>
										<p className="text-sm text-muted-foreground">
											{formatDuration(route.duration)} ·{" "}
											{mode === "driving" ? "by car" : "on foot"}
										</p>
									</div>
								</div>
							</div>

							{/* Step list */}
							<ul className="flex-1 divide-y divide-border overflow-y-auto">
								<StepList steps={route.steps} />
							</ul>
						</>
					) : null}
				</aside>
			</div>
		</div>
	);
}

function StepList({ steps }: { steps: OsrmStep[] }) {
	return (
		<>
			{steps.map((step, i) => {
				const Icon = getManeuverIcon(step.maneuver.type, step.maneuver.modifier);
				const isLast = i === steps.length - 1;
				return (
					<li key={i} className="flex items-start gap-3 px-4 py-3">
						<div
							className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
								isLast
									? "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400"
									: "bg-muted text-foreground"
							}`}
						>
							<Icon className="size-4" />
						</div>
						<div className="flex-1">
							<p className="text-sm leading-snug">{getStepInstruction(step)}</p>
							{step.distance > 0 && (
								<p className="mt-0.5 text-xs text-muted-foreground">
									{formatDistance(step.distance)}
									{step.duration > 0 && ` · ${formatDuration(step.duration)}`}
								</p>
							)}
						</div>
					</li>
				);
			})}
		</>
	);
}

function StepsSkeleton() {
	return (
		<ul className="divide-y divide-border">
			{[0, 1, 2, 3, 4].map((i) => (
				<li key={i} className="flex items-start gap-3 px-4 py-3">
					<div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
					<div className="flex-1 space-y-2 pt-1">
						<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-2.5 w-1/3 animate-pulse rounded bg-muted" />
					</div>
				</li>
			))}
		</ul>
	);
}
