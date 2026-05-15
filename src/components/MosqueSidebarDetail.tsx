import { useState, useCallback, useEffect, type ElementType } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Check,
	X,
	Droplets,
	Car,
	Bath,
	Globe,
	Phone,
	Accessibility,
	ImageOff,
	MapPin,
	Heart,
	ZoomIn,
	Users,
} from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import type { NearbyMosque } from "#/lib/types.ts";

export function MosqueSidebarDetail({
	mosque,
	photos,
	photosLoading,
	onBack,
}: {
	mosque: NearbyMosque;
	photos: string[];
	photosLoading: boolean;
	onBack: () => void;
}) {
	const facilities: { icon: ElementType; label: string; value: boolean }[] = [
		{ icon: Droplets, label: "Area Wudhu", value: mosque.hasWudhuArea },
		{ icon: Users, label: "Pisah Pria/Wanita", value: mosque.hasSeparateMenWomen },
		{ icon: Car, label: "Parkir", value: mosque.hasParking },
		{ icon: Accessibility, label: "Ramah Kursi Roda", value: mosque.isWheelchairAccessible },
		{ icon: Bath, label: "Toilet", value: mosque.hasRestrooms },
	];

	const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
	const closeZoom = useCallback(() => setZoomedPhoto(null), []);

	useEffect(() => {
		if (!zoomedPhoto) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeZoom();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [zoomedPhoto, closeZoom]);

	return (
		<>
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

					{/* Foto */}
					<div>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Foto</p>
						{photosLoading ? (
							<div className="grid grid-cols-2 gap-2">
								{[0, 1].map((i) => (
									<div key={i} className="aspect-video animate-pulse rounded-lg bg-muted" />
								))}
							</div>
						) : photos.length > 0 ? (
							<div className="grid grid-cols-2 gap-2">
								{photos.map((url, idx) => (
									<button
										type="button"
										key={idx}
										className="group relative aspect-video overflow-hidden rounded-lg bg-muted"
										onClick={() => setZoomedPhoto(url)}
									>
										<img
											src={url}
											alt={`${mosque.name} foto ${idx + 1}`}
											className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
											<ZoomIn className="size-6 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
										</div>
									</button>
								))}
							</div>
						) : (
							<div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed">
								<ImageOff className="size-5 text-muted-foreground" />
								<p className="mt-1 text-xs text-muted-foreground">Belum ada foto</p>
							</div>
						)}
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
									href={`tel:${mosque.contact}`}
									className="flex items-center gap-2 text-sm text-primary hover:underline"
								>
									<Phone className="size-4 shrink-0" />
									{mosque.contact}
								</a>
							)}
						</div>
					)}
				</div>

				{/* Footer actions */}
				<div className="shrink-0 space-y-2 border-t border-border p-3">
					<Button asChild variant="outline" className="w-full gap-2">
						<Link to="/donasi">
							<Heart className="size-4" />
							Donasi
						</Link>
					</Button>
				</div>
			</div>

			{/* Lightbox */}
			{zoomedPhoto &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
						onClick={closeZoom}
						role="dialog"
						aria-modal="true"
					>
						<button
							type="button"
							className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
							onClick={closeZoom}
							aria-label="Tutup"
						>
							<X className="size-5" />
						</button>
						<img
							src={zoomedPhoto}
							alt="Foto diperbesar"
							className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
							onClick={(e) => e.stopPropagation()}
						/>
					</div>,
					document.body,
				)}
		</>
	);
}
