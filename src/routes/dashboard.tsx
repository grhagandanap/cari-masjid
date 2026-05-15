import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Map, Marker, Overlay } from "pigeon-maps";
import {
	MapPin,
	Users,
	Plus,
	Navigation,
	Search,
	X,
	SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "#/hooks/use-auth.ts";
import { useGeolocation } from "#/hooks/use-geolocation.ts";
import { getNearbyMosques, getMosqueDetails } from "#/lib/server/mosques.ts";
import { Button } from "#/components/ui/button.tsx";
import { ListSkeleton } from "#/components/ListSkeleton";
import { MosqueSidebarDetail } from "#/components/MosqueSidebarDetail";
import type { NearbyMosque } from "#/lib/types.ts";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];

function Dashboard() {
	const { user, isPending } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isPending && !user) {
			navigate({ to: "/" });
		}
	}, [isPending, user, navigate]);

	const { location, error: geoError, isLoading: geoLoading } = useGeolocation();
	const [mosques, setMosques] = useState<NearbyMosque[]>([]);
	const [loading, setLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [sidebarView, setSidebarView] = useState<"list" | "detail">("list");
	const [zoom, setZoom] = useState(13);
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filterType, setFilterType] = useState<"all" | "masjid" | "musholla">("all");
	const [filterMaxDist, setFilterMaxDist] = useState(false);
	const [filterFacilities, setFilterFacilities] = useState({
		wudhu: false, parking: false, toilet: false, separate: false, wheelchair: false,
	});
	const [photosCache, setPhotosCache] = useState<Record<string, string[]>>({});
	const [photosLoading, setPhotosLoading] = useState(false);

	useEffect(() => {
		if (!location) return;
		setLoading(true);
		setFetchError(null);
		getNearbyMosques({
			data: { lat: location.lat, lng: location.lng },
		})
			.then((data) => setMosques(data))
			.catch(() => setFetchError("Gagal memuat masjid terdekat."))
			.finally(() => setLoading(false));
	}, [location]);

	const center = useMemo<[number, number]>(() => {
		if (location) return [location.lat, location.lng];
		return DEFAULT_CENTER;
	}, [location]);

	const activeMosque = mosques.find((m) => m.id === activeId) ?? null;

	const filteredMosques = useMemo(() => {
		return mosques.filter((m) => {
			const q = searchQuery.trim().toLowerCase();
			if (q && !m.name.toLowerCase().includes(q) && !m.address?.toLowerCase().includes(q)) return false;
			if (filterType !== "all" && m.type.toLowerCase() !== filterType) return false;
			if (filterMaxDist && m.distance > 1) return false;
			if (filterFacilities.wudhu && !m.hasWudhuArea) return false;
			if (filterFacilities.parking && !m.hasParking) return false;
			if (filterFacilities.toilet && !m.hasRestrooms) return false;
			if (filterFacilities.separate && !m.hasSeparateMenWomen) return false;
			if (filterFacilities.wheelchair && !m.isWheelchairAccessible) return false;
			return true;
		});
	}, [mosques, searchQuery, filterType, filterMaxDist, filterFacilities]);

	const hasActiveFilter = filterType !== "all" || filterMaxDist || Object.values(filterFacilities).some(Boolean);

	function openDetail(id: string) {
		setActiveId(id);
		setSidebarView("detail");
		if (!photosCache[id]) {
			setPhotosLoading(true);
			getMosqueDetails({ data: { mosqueId: id } })
				.then((data) => {
					if (data?.photos) {
						setPhotosCache((prev) => ({ ...prev, [id]: data.photos! }));
					}
				})
				.finally(() => setPhotosLoading(false));
		}
	}

	if (isPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
			</div>
		);
	}

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
			{/* Greeting */}
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">
						Assalamu&apos;alaikum, {user?.name?.split(" ")[0] || "friend"}
					</p>
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Masjid di Sekitar Anda
					</h1>
				</div>
			</div>

			<div className="grid gap-5 lg:grid-cols-[1fr_360px]">
				{/* Map */}
				<div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					<div className="h-[70vh] min-h-[480px] w-full">
						{geoLoading ? (
							<div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
								<div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
								<p className="text-sm">Mendapatkan lokasi Anda…</p>
							</div>
						) : (
							<Map
								center={center}
								zoom={zoom}
								onBoundsChanged={({ zoom: z }) => setZoom(z)}
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

								{/* Mosque markers */}
								{filteredMosques.map((m) => (
									<Marker
										key={m.id}
										anchor={[m.latitude, m.longitude]}
										color={m.id === activeId ? "#0d9488" : "#10b981"}
										onClick={() => setActiveId(m.id)}
										width={36}
									/>
								))}
							</Map>
						)}
					</div>

					{/* Geo error overlay */}
					{geoError && !geoLoading ? (
						<div className="absolute left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 text-center shadow-lg">
							<MapPin className="mx-auto size-8 text-muted-foreground" />
							<h3 className="mt-2 font-semibold">Akses lokasi diperlukan</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Izinkan akses lokasi untuk melihat masjid terdekat.
							</p>
							<Button
								className="mt-4"
								onClick={() => window.location.reload()}
							>
								Izinkan Akses Lokasi
							</Button>
						</div>
					) : null}

					{/* Active mosque popup */}
					{activeMosque ? (
						<div className="absolute bottom-4 left-1/2 w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-xl">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">
										{activeMosque.type}
									</p>
									<h3 className="truncate font-semibold">{activeMosque.name}</h3>
									{activeMosque.address ? (
										<p className="truncate text-xs text-muted-foreground">
											{activeMosque.address}
										</p>
									) : null}
									<p className="mt-1 text-xs font-medium text-emerald-700">
										{activeMosque.distance.toFixed(1)} km dari lokasi Anda
									</p>
								</div>
								<button
									type="button"
									className="rounded-md p-1 text-muted-foreground hover:bg-accent"
									onClick={() => setActiveId(null)}
									aria-label="Close"
								>
									×
								</button>
							</div>
							<div className="mt-3 flex gap-2">
								<Button
									size="sm"
									className="flex-1"
									onClick={() => setSidebarView("detail")}
								>
									Lihat Detail
								</Button>
								<Button
									size="sm"
									variant="outline"
									className="gap-1.5"
									onClick={() =>
										navigate({
											to: "/mosque/$mosqueId",
											params: { mosqueId: activeMosque.id },
											search: { directions: true },
										})
									}
								>
									<Navigation className="size-3.5" />
									Petunjuk Arah
								</Button>
							</div>
						</div>
					) : null}
				</div>

				{/* Side panel */}
				<aside className="flex max-h-[70vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					{sidebarView === "detail" && activeMosque ? (
						<MosqueSidebarDetail
							mosque={activeMosque}
							photos={photosCache[activeMosque.id] ?? []}
							photosLoading={photosLoading && !photosCache[activeMosque.id]}
							onBack={() => setSidebarView("list")}
						/>
					) : (
						<>
							{/* Search + Filter */}
							<div className="shrink-0 border-b border-border">
								<div className="flex items-center gap-2 px-3 py-2.5">
									<Search className="size-4 shrink-0 text-muted-foreground" />
									<input
										type="text"
										placeholder="Cari nama atau alamat..."
										className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
									/>
									{searchQuery && (
										<button
											type="button"
											onClick={() => setSearchQuery("")}
											className="text-muted-foreground hover:text-foreground"
										>
											<X className="size-3.5" />
										</button>
									)}
									<button
										type="button"
										onClick={() => setShowFilters((v) => !v)}
										className={`relative flex size-7 items-center justify-center rounded-md transition hover:bg-accent ${showFilters ? "bg-accent text-foreground" : "text-muted-foreground"}`}
										aria-label="Filter"
									>
										<SlidersHorizontal className="size-4" />
										{hasActiveFilter && (
											<span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-emerald-500" />
										)}
									</button>
								</div>
								{showFilters && (
									<div className="space-y-2 border-t border-border/60 px-3 py-2.5">
										{/* Type */}
										<div className="flex gap-1">
											{(["all", "masjid", "musholla"] as const).map((t) => (
												<button
													key={t}
													type="button"
													onClick={() => setFilterType(t)}
													className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
														filterType === t
															? "bg-emerald-600 text-white"
															: "bg-muted text-muted-foreground hover:bg-muted/80"
													}`}
												>
													{t === "all" ? "Semua" : t.charAt(0).toUpperCase() + t.slice(1)}
												</button>
											))}
										</div>
										{/* Distance + Facilities */}
										<div className="flex flex-wrap gap-1">
											{[
												{ key: "dist", label: "≤ 1 km", active: filterMaxDist, toggle: () => setFilterMaxDist((v) => !v) },
												{ key: "wudhu", label: "Wudhu", active: filterFacilities.wudhu, toggle: () => setFilterFacilities((v) => ({ ...v, wudhu: !v.wudhu })) },
												{ key: "parking", label: "Parkir", active: filterFacilities.parking, toggle: () => setFilterFacilities((v) => ({ ...v, parking: !v.parking })) },
												{ key: "toilet", label: "Toilet", active: filterFacilities.toilet, toggle: () => setFilterFacilities((v) => ({ ...v, toilet: !v.toilet })) },
												{ key: "separate", label: "Pisah P/W", active: filterFacilities.separate, toggle: () => setFilterFacilities((v) => ({ ...v, separate: !v.separate })) },
												{ key: "wheelchair", label: "Kursi Roda", active: filterFacilities.wheelchair, toggle: () => setFilterFacilities((v) => ({ ...v, wheelchair: !v.wheelchair })) },
											].map(({ key, label, active, toggle }) => (
												<button
													key={key}
													type="button"
													onClick={toggle}
													className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
														active
															? "bg-emerald-600 text-white"
															: "bg-muted text-muted-foreground hover:bg-muted/80"
													}`}
												>
													{label}
												</button>
											))}
										</div>
									</div>
								)}
								<div className="px-4 py-1 text-xs text-muted-foreground">
									{loading ? "Memuat..." : `${filteredMosques.length} dari ${mosques.length} masjid`}
								</div>
							</div>

							{/* List */}
							<div className="flex-1 overflow-y-auto">
								{loading ? (
									<ListSkeleton />
								) : fetchError ? (
									<div className="p-6 text-center text-sm text-destructive">
										{fetchError}
									</div>
								) : mosques.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
										<Users className="size-8 text-muted-foreground" />
										<p className="mt-3 text-sm font-medium">
											Tidak ada masjid di sekitar
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Jadi yang pertama menambahkan!
										</p>
										<Button asChild size="sm" className="mt-4 gap-1.5">
											<Link to="/mosque/add">
												<Plus className="size-4" />
												Tambah Masjid
											</Link>
										</Button>
									</div>
								) : filteredMosques.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
										<Search className="size-8 text-muted-foreground" />
										<p className="mt-3 text-sm font-medium">Tidak ada hasil</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Coba ubah kata kunci atau filter.
										</p>
									</div>
								) : (
									<ul className="divide-y divide-border">
										{filteredMosques.map((m) => (
											<li key={m.id}>
												<button
													type="button"
													onClick={() => openDetail(m.id)}
													className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-accent/60 ${
														m.id === activeId ? "bg-accent/80" : ""
													}`}
												>
													<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
														<MapPin className="size-5" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate font-medium">{m.name}</p>
														{m.address ? (
															<p className="truncate text-xs text-muted-foreground">
																{m.address}
															</p>
														) : null}
														<p className="mt-0.5 text-xs font-medium text-emerald-700">
															{m.distance.toFixed(1)} km
														</p>
													</div>
												</button>
											</li>
										))}
									</ul>
								)}
							</div>
						</>
					)}
				</aside>
			</div>
		</main>
	);
}
