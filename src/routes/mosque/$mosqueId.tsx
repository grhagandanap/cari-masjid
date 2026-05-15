import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { DirectionsView } from "#/components/DirectionsView.tsx";
import {
	Check,
	X,
	MapPin,
	Navigation,
	Globe,
	Phone,
	Car,
	Droplets,
	Users,
	Bath,
	Accessibility,
	ImageOff,
	ArrowLeft,
} from "lucide-react";
import { getMosqueDetails } from "#/lib/server/mosques.ts";
import { Button } from "#/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

export const Route = createFileRoute("/mosque/$mosqueId")({
	validateSearch: (search: Record<string, unknown>) => ({
		directions: search.directions === true || search.directions === "true",
	}),
	loader: async ({ params }) => {
		const mosque = await getMosqueDetails({ data: { mosqueId: params.mosqueId } });
		return { mosque };
	},
	component: MosqueDetailsPage,
});

function MosqueDetailsPage() {
	const { mosqueId } = useParams({ from: "/mosque/$mosqueId" });
	const { mosque } = Route.useLoaderData();
	const { directions } = Route.useSearch();
	const navigate = useNavigate();

	if (directions && mosque) {
		return (
			<DirectionsView
				mosqueName={mosque.name}
				mosqueAddress={mosque.address}
				lat={mosque.latitude}
				lng={mosque.longitude}
				onClose={() =>
					navigate({
						to: "/mosque/$mosqueId",
						params: { mosqueId },
						search: { directions: false },
					})
				}
			/>
		);
	}

	if (!mosque) {
		return (
			<div className="flex flex-col px-4 py-12">
				<div className="mx-auto w-full max-w-4xl text-center">
					<h1 className="text-2xl font-bold">Masjid tidak ditemukan</h1>
					<p className="mt-2 text-muted-foreground">
						Kami tidak dapat menemukan masjid dengan ID <code>{mosqueId}</code>.
					</p>
					<Button asChild className="mt-6">
						<Link to="/">
							<ArrowLeft className="mr-2 size-4" />
							Kembali ke Beranda
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const facilityItems = [
		{ icon: Droplets, label: "Area Wudu", value: mosque.hasWuduArea },
		{ icon: Users, label: "Pisah Pria/Wanita", value: mosque.hasSeparateMenWomen },
		{ icon: Car, label: "Parkir", value: mosque.hasParking },
		{ icon: Accessibility, label: "Ramah Kursi Roda", value: mosque.isWheelchairAccessible },
		{ icon: Bath, label: "Toilet", value: mosque.hasRestrooms },
	];

	return (
		<div className="flex flex-col px-4 py-12">
			<div className="mx-auto w-full max-w-4xl">
				<Button asChild variant="ghost" className="mb-6 -ml-3">
					<Link to="/">
						<ArrowLeft className="mr-2 size-4" />
						Kembali
					</Link>
				</Button>

				{/* Header */}
				<div className="space-y-2">
					<div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
						{mosque.type}
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight">{mosque.name}</h1>
					{mosque.address ? (
						<p className="flex items-center gap-1.5 text-lg text-muted-foreground">
							<MapPin className="size-5 shrink-0" />
							{mosque.address}
						</p>
					) : null}
				</div>

				{/* Actions */}
				<div className="mt-6">
					<Button
						size="lg"
						className="gap-2"
						onClick={() =>
							navigate({
								to: "/mosque/$mosqueId",
								params: { mosqueId },
								search: { directions: true },
							})
						}
					>
						<Navigation className="size-5" />
						Petunjuk Arah
					</Button>
				</div>

				{/* Contact & Links */}
				{(mosque.website || mosque.contact) && (
					<Card className="mt-8">
						<CardHeader>
							<CardTitle>Kontak</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{mosque.website ? (
								<a
									href={mosque.website}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-primary hover:underline"
								>
									<Globe className="size-4" />
									{mosque.website}
								</a>
							) : null}
							{mosque.contact ? (
								<a
									href={`tel:${mosque.contact}`}
									className="flex items-center gap-2 text-primary hover:underline"
								>
									<Phone className="size-4" />
									{mosque.contact}
								</a>
							) : null}
						</CardContent>
					</Card>
				)}

				{/* Facilities */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Fasilitas</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-3 sm:grid-cols-2">
							{facilityItems.map((item) => (
								<li
									key={item.label}
									className="flex items-center gap-3"
								>
									<div
										className={`flex size-6 items-center justify-center rounded-full ${
											item.value
												? "bg-green-100 text-green-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{item.value ? (
											<Check className="size-4" />
										) : (
											<X className="size-4" />
										)}
									</div>
									<span className="flex items-center gap-2 text-sm">
										<item.icon className="size-4 text-muted-foreground" />
										{item.label}
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				{/* Photo Gallery */}
				<div className="mt-8">
					<h2 className="mb-4 text-2xl font-bold">Foto</h2>
					{mosque.photos && mosque.photos.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{mosque.photos.map((url, idx) => (
								<div
									key={idx}
									className="aspect-video overflow-hidden rounded-lg bg-muted"
								>
									<img
										src={url}
										alt={`${mosque.name} photo ${idx + 1}`}
										className="h-full w-full object-cover"
									/>
								</div>
							))}
						</div>
					) : (
						<div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
							<ImageOff className="size-8 text-muted-foreground" />
							<p className="mt-2 text-sm text-muted-foreground">
								Belum ada foto.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
