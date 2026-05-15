import { useState, useEffect, useMemo } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Map, Marker, Overlay } from "pigeon-maps";
import {
	MapPin,
	Compass,
	Users,
	Plus,
	Navigation,
	Search,
	Sparkles,
	HandHeart,
	ArrowLeft,
	Check,
	X,
	Droplets,
	Car,
	Bath,
	Globe,
	Phone,
	Accessibility,
} from "lucide-react";
import { useAuth } from "#/hooks/use-auth.ts";
import { useGeolocation } from "#/hooks/use-geolocation.ts";
import { getNearbyMosques } from "#/lib/server/mosques.ts";
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

	if (isPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Landing />;
	}

	return <Dashboard />;
}

/* ------------------------------------------------------------------ */
/* Landing (unauthenticated)                                          */
/* ------------------------------------------------------------------ */

function Landing() {
	const features = [
		{
			icon: Compass,
			title: "Temukan Terdekat",
			desc: "Temukan masjid di sekitar Anda dengan jarak real-time dan petunjuk arah satu ketuk.",
		},
		{
			icon: Sparkles,
			title: "Fasilitas Terverifikasi",
			desc: "Lihat area wudu, parkir, aksesibilitas dan lainnya sebelum Anda tiba.",
		},
		{
			icon: HandHeart,
			title: "Digerakkan Komunitas",
			desc: "Bantu sesama dengan menambahkan masjid dan menjaga informasi tetap terkini.",
		},
	];

	return (
		<main className="relative overflow-hidden">
			{/* Decorative gradients */}
			<div
				className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-300/40 via-teal-300/30 to-transparent blur-3xl"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 size-[500px] rounded-full bg-gradient-to-tr from-teal-300/30 to-transparent blur-3xl"
				aria-hidden
			/>

			{/* Hero */}
			<section className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
				<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
					<span className="flex size-1.5 rounded-full bg-emerald-500" />
					Menghubungkan komunitas, satu masjid dalam satu waktu
				</div>

				<h1 className="display-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
					Temukan{" "}
					<span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
						masjid
					</span>
					{" "}terdekat,
					<br className="hidden sm:block" /> dengan mudah &amp; jelas.
				</h1>

				<p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
					CariMasjid membantu Anda menemukan tempat sholat di sekitar, cek fasilitas,
					dapatkan petunjuk arah, dan berkontribusi pada peta komunitas.
				</p>

				{/* <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
					<Button asChild size="lg" className="gap-2 px-7">
						<Link to="/auth/register">
							Get Started
							<ArrowRight className="size-4" />
						</Link>
					</Button>
					<Button asChild variant="outline" size="lg" className="px-7">
						<Link to="/auth/login" search={{ redirect: undefined }}>
							Login
						</Link>
					</Button>
				</div> */}

				<p className="mt-6 text-xs text-muted-foreground">
					Gratis selamanya · Tanpa kartu kredit
				</p>
			</section>

			{/* Features */}
			<section className="mx-auto w-full max-w-6xl px-4 pb-24">
				<div className="grid gap-5 md:grid-cols-3">
					{features.map((f) => (
						<div
							key={f.title}
							className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
						>
							<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
								<f.icon className="size-5" />
							</div>
							<h3 className="text-lg font-semibold">{f.title}</h3>
							<p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
						</div>
					))}
				</div>

				{/* CTA strip */}
				<div className="mt-16 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-center text-white shadow-xl sm:p-14">
					<h2 className="text-3xl font-bold sm:text-4xl">
						Bergabung dengan komunitas sekarang
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-emerald-50">
						Daftar untuk melihat peta masjid terdekat dan tambahkan yang Anda ketahui.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Button
							asChild
							size="lg"
							className="bg-white px-7 text-emerald-700 hover:bg-emerald-50"
						>
							<Link to="/auth/register">Buat akun gratis</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="border-white/40 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
						>
							<Link to="/auth/login" search={{ redirect: undefined }}>
								Saya sudah punya akun
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</main>
	);
}

/* ------------------------------------------------------------------ */
/* Dashboard (authenticated)                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456];

function Dashboard() {
	const { user } = useAuth();
	const { location, error: geoError, isLoading: geoLoading } = useGeolocation();
	const [mosques, setMosques] = useState<NearbyMosque[]>([]);
	const [loading, setLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [sidebarView, setSidebarView] = useState<"list" | "detail">("list");
	const [zoom, setZoom] = useState(13);
	const navigate = useNavigate();

	useEffect(() => {
		if (!location) return;
		setLoading(true);
		setFetchError(null);
		getNearbyMosques({
			data: { lat: location.lat, lng: location.lng },
		})
			.then((data) => setMosques(data))
			.catch(() => setFetchError("Failed to load nearby mosques."))
			.finally(() => setLoading(false));
	}, [location]);

	const center = useMemo<[number, number]>(() => {
		if (location) return [location.lat, location.lng];
		return DEFAULT_CENTER;
	}, [location]);

	const activeMosque = mosques.find((m) => m.id === activeId) ?? null;

	function openDetail(id: string) {
		setActiveId(id);
		setSidebarView("detail");
	}

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
			{/* Greeting */}
			<div className="mb-5 flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-sm text-muted-foreground">
						Assalamu&apos;alaikum, {user?.name?.split(" ")[0] || "friend"} 👋
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
								<p className="text-sm">Getting your location…</p>
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
								{mosques.map((m) => (
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
							<h3 className="mt-2 font-semibold">Location access needed</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Allow location access to see mosques near you.
							</p>
							<Button
								className="mt-4"
								onClick={() => window.location.reload()}
							>
								Allow Location Access
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
										{activeMosque.distance.toFixed(1)} km away
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
							onBack={() => setSidebarView("list")}
							onDirections={() =>
								navigate({
									to: "/mosque/$mosqueId",
									params: { mosqueId: activeMosque.id },
									search: { directions: true },
								})
							}
						/>
					) : (
						<>
							<div className="border-b border-border px-4 py-3">
								<div className="flex items-center gap-2 text-sm font-medium">
									<Search className="size-4 text-muted-foreground" />
									<span>Terdekat ({mosques.length})</span>
								</div>
							</div>
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
								) : (
									<ul className="divide-y divide-border">
										{mosques.map((m) => (
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

function ListSkeleton() {
	return (
		<ul className="divide-y divide-border">
			{[0, 1, 2, 3, 4].map((i) => (
				<li key={i} className="flex items-start gap-3 px-4 py-3">
					<div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
					<div className="flex-1 space-y-2">
						<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
					</div>
				</li>
			))}
		</ul>
	);
}

function MosqueSidebarDetail({
	mosque,
	onBack,
	onDirections,
}: {
	mosque: NearbyMosque;
	onBack: () => void;
	onDirections: () => void;
}) {
	const facilities: { icon: React.ElementType; label: string; value: boolean }[] = [
		{ icon: Droplets, label: "Area Wudu", value: mosque.hasWuduArea },
		{ icon: Users, label: "Pisah Pria/Wanita", value: mosque.hasSeparateMenWomen },
		{ icon: Car, label: "Parkir", value: mosque.hasParking },
		{ icon: Accessibility, label: "Ramah Kursi Roda", value: mosque.isWheelchairAccessible },
		{ icon: Bath, label: "Toilet", value: mosque.hasRestrooms },
	];

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
				<button
					type="button"
					onClick={onBack}
					className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
				>
					<ArrowLeft className="size-3.5" />
					Kembali
				</button>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{/* Name & type */}
				<div>
					<span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium capitalize text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
						{mosque.type}
					</span>
					<h2 className="mt-1.5 text-lg font-bold leading-tight">{mosque.name}</h2>
					{mosque.address ? (
						<p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
							<MapPin className="mt-0.5 size-3.5 shrink-0" />
							{mosque.address}
						</p>
					) : null}
					<p className="mt-1.5 text-xs font-semibold text-emerald-700">
						{mosque.distance.toFixed(1)} km dari lokasi Anda
					</p>
				</div>

				{/* Fasilitas */}
				<div>
					<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fasilitas</p>
					<div className="grid grid-cols-2 gap-1.5">
						{facilities.map(({ icon: Icon, label, value }) => (
							<div
								key={label}
								className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
									value
										? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
										: "bg-muted/50 text-muted-foreground line-through"
								}`}
							>
								{value ? (
									<Check className="size-3.5 shrink-0" />
								) : (
									<X className="size-3.5 shrink-0" />
								)}
								<Icon className="size-3.5 shrink-0" />
								{label}
							</div>
						))}
					</div>
				</div>

				{/* Kontak */}
				{(mosque.website || mosque.contact) && (
					<div className="space-y-1.5">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kontak</p>
						{mosque.website && (
							<a
								href={mosque.website}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-primary hover:underline"
							>
								<Globe className="size-4 shrink-0" />
								<span className="truncate">{mosque.website}</span>
							</a>
						)}
						{mosque.contact && (
							<a
								className="flex items-center gap-2 text-sm text-primary hover:underline"
							>
								<Phone className="size-4 shrink-0" />
								{mosque.contact}
							</a>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
