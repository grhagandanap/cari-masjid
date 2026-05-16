import { useState, useMemo, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Map, Marker } from "pigeon-maps";
import { toast } from "sonner";
import { ImagePlus, X, LocateFixed } from "lucide-react";
import { requireAuth } from "#/lib/route-guard.ts";
import { createMosque } from "#/lib/server/mosques.ts";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import { Checkbox } from "#/components/ui/checkbox.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { Alert, AlertDescription } from "#/components/ui/alert.tsx";

export const Route = createFileRoute("/mosque/add")({
	beforeLoad: async () => {
		await requireAuth({ to: "/auth/login" });
	},
	component: AddMosquePage,
});

interface FacilityOption {
	id: string;
	label: string;
	key: keyof FacilityState;
}

interface FacilityState {
	hasWudhuArea: boolean;
	hasSeparateMenWomen: boolean;
	hasParking: boolean;
	isWheelchairAccessible: boolean;
	hasRestrooms: boolean;
}

const facilityOptions: FacilityOption[] = [
	{ id: "wudhu", label: "Area Wudhu", key: "hasWudhuArea" },
	{ id: "gender", label: "Pisah Pria/Wanita", key: "hasSeparateMenWomen" },
	{ id: "parking", label: "Parkir", key: "hasParking" },
	{ id: "accessible", label: "Ramah Kursi Roda", key: "isWheelchairAccessible" },
	{ id: "restroom", label: "Toilet", key: "hasRestrooms" },
];

const MOSQUE_TYPES = [
	{ value: "masjid", label: "Masjid" },
	{ value: "musholla", label: "Musholla" },
];

function AddMosquePage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [type, setType] = useState("masjid");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [address, setAddress] = useState("");
	const [website, setWebsite] = useState("");
	const [contact, setContact] = useState("");
	const [facilities, setFacilities] = useState<FacilityState>({
		hasWudhuArea: false,
		hasSeparateMenWomen: false,
		hasParking: false,
		isWheelchairAccessible: false,
		hasRestrooms: false,
	});
	const [photos, setPhotos] = useState<{ file: File; dataUrl: string }[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [locating, setLocating] = useState(false);

	function useCurrentLocation() {
		if (!navigator.geolocation) {
			toast.error("Geolokasi tidak didukung di browser ini.");
			return;
		}
		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLatitude(String(pos.coords.latitude));
				setLongitude(String(pos.coords.longitude));
				setLocating(false);
			},
			() => {
				toast.error("Gagal mendapatkan lokasi. Periksa izin lokasi Anda.");
				setLocating(false);
			},
			{ enableHighAccuracy: true },
		);
	}

	const mapCenter = useMemo<[number, number]>(() => {
		const lat = parseFloat(latitude);
		const lng = parseFloat(longitude);
		if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng];
		return [-6.2088, 106.8456];
	}, [latitude, longitude]);

	function toggleFacility(key: keyof FacilityState) {
		setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	function addFiles(fileList: FileList) {
		Array.from(fileList).forEach((file) => {
			if (!file.type.startsWith("image/")) return;
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`${file.name} melebihi batas 5 MB.`);
				return;
			}
			const reader = new FileReader();
			reader.onload = (e) => {
				setPhotos((prev) => [
					...prev,
					{ file, dataUrl: e.target?.result as string },
				]);
			};
			reader.readAsDataURL(file);
		});
	}

	function removePhoto(idx: number) {
		setPhotos((prev) => prev.filter((_, i) => i !== idx));
	}

	async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);

		try {
			const lat = parseFloat(latitude);
			const lng = parseFloat(longitude);

			if (Number.isNaN(lat) || Number.isNaN(lng)) {
				setError("Garis Lintang dan Garis Bujur harus berupa angka yang valid.");
				return;
			}

			const mosque = await createMosque({
				data: {
					name,
					type,
					latitude: lat,
					longitude: lng,
					address: address || undefined,
					website: website || undefined,
					contact: contact || undefined,
					photos: photos.map((p) => p.dataUrl),
					...facilities,
				},
			});

			toast.success(`${mosque.name} berhasil ditambahkan!`);
			await navigate({
				to: "/mosque/$mosqueId",
				params: { mosqueId: mosque.id },
				search: { directions: false },
			});
		} catch (err: any) {
			console.error("createMosque error:", err);
			setError(err?.message || "Gagal menambahkan masjid. Coba lagi.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex flex-col px-4 py-12">
			<div className="mx-auto w-full max-w-2xl">
				<h1 className="text-3xl font-bold">Tambah Masjid</h1>
				<p className="mt-2 text-muted-foreground">
					Berkontribusi untuk komunitas dengan menambahkan masjid baru.
				</p>

				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Informasi Masjid</CardTitle>
						<CardDescription>
							Isi detail di bawah ini. Kolom bertanda{" "}
							<span className="text-destructive">*</span> wajib diisi.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="flex flex-col gap-5" onSubmit={onSubmit}>
							{/* Nama */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="name">
									Nama <span className="text-destructive">*</span>
								</Label>
								<Input
									id="name"
									required
									value={name}
									onChange={(ev) => setName(ev.target.value)}
									placeholder="cth. Masjid Al-Haram"
								/>
							</div>

							{/* Jenis */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="type">
									Jenis <span className="text-destructive">*</span>
								</Label>
								<select
									id="type"
									value={type}
									onChange={(e) => setType(e.target.value)}
									className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								>
									{MOSQUE_TYPES.map((t) => (
										<option key={t.value} value={t.value}>
											{t.label}
										</option>
									))}
								</select>
							</div>

							{/* Koordinat */}
							<div className="flex flex-col gap-2">
								<div className="flex items-center justify-between">
									<Label>Koordinat <span className="text-destructive">*</span></Label>
									<button
										type="button"
										onClick={useCurrentLocation}
										disabled={locating}
										className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
									>
										{locating ? (
											<span className="size-3.5 animate-spin rounded-full border border-current border-t-transparent" />
										) : (
											<LocateFixed className="size-3.5" />
										)}
										{locating ? "Mendapatkan lokasi…" : "Gunakan Lokasi Saya"}
									</button>
								</div>
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="flex flex-col gap-2">
										<Label htmlFor="latitude">
											Garis Lintang
										</Label>
										<Input
											id="latitude"
											type="number"
											step="any"
											required
											value={latitude}
											onChange={(ev) => setLatitude(ev.target.value)}
											placeholder="-6.2088"
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="longitude">
											Garis Bujur
										</Label>
										<Input
											id="longitude"
											type="number"
											step="any"
											required
											value={longitude}
											onChange={(ev) => setLongitude(ev.target.value)}
											placeholder="106.8456"
										/>
									</div>
								</div>
							</div>

							{/* Peta */}
							<div className="flex flex-col gap-2">
								<Label>Tandai lokasi di peta</Label>
								<Map
									center={mapCenter}
									zoom={13}
									height={280}
									onClick={({ latLng }) => {
										const [lat, lng] = latLng;
										setLatitude(String(lat));
										setLongitude(String(lng));
									}}
								>
									{latitude && longitude ? (
										<Marker
											anchor={[parseFloat(latitude), parseFloat(longitude)]}
											width={32}
											height={32}
										/>
									) : null}
								</Map>
								<p className="text-xs text-muted-foreground">
									Klik di peta untuk menentukan lokasi, atau isi koordinat secara manual.
								</p>
							</div>

							{/* Alamat */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="address">Alamat</Label>
								<Textarea
									id="address"
									value={address}
									onChange={(ev) => setAddress(ev.target.value)}
									placeholder="Alamat lengkap"
								/>
							</div>

							{/* Website */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="website">
									Website{" "}
									<span className="text-xs font-normal text-muted-foreground">
										(opsional)
									</span>
								</Label>
								<Input
									id="website"
									type="url"
									value={website}
									onChange={(ev) => setWebsite(ev.target.value)}
									placeholder="https://contoh.com"
								/>
							</div>

							{/* Kontak */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="contact">
									Kontak{" "}
									<span className="text-xs font-normal text-muted-foreground">
										(opsional)
									</span>
								</Label>
								<Input
									id="contact"
									type="tel"
									value={contact}
									onChange={(ev) => setContact(ev.target.value)}
									placeholder="Nomor telepon"
								/>
							</div>

							{/* Fasilitas */}
							<div className="flex flex-col gap-3">
								<Label>Fasilitas</Label>
								<div className="grid gap-3 sm:grid-cols-2">
									{facilityOptions.map((opt) => (
										<div key={opt.id} className="flex items-center gap-2">
											<Checkbox
												id={opt.id}
												checked={facilities[opt.key]}
												onCheckedChange={() => toggleFacility(opt.key)}
											/>
											<Label
												htmlFor={opt.id}
												className="cursor-pointer font-normal"
											>
												{opt.label}
											</Label>
										</div>
									))}
								</div>
							</div>

							{/* Foto */}
							<div className="flex flex-col gap-3">
								<Label>
									Foto Masjid{" "}
									<span className="text-xs font-normal text-muted-foreground">
										(opsional)
									</span>
								</Label>

								{/* Drop zone */}
								<button
									type="button"
									className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
										isDragging
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/50 hover:bg-accent/40"
									}`}
									onDragOver={(e) => {
										e.preventDefault();
										setIsDragging(true);
									}}
									onDragLeave={() => setIsDragging(false)}
									onDrop={(e) => {
										e.preventDefault();
										setIsDragging(false);
										addFiles(e.dataTransfer.files);
									}}
									onClick={() => fileInputRef.current?.click()}
								>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={(e) => {
											if (e.target.files) addFiles(e.target.files);
											e.target.value = "";
										}}
									/>
									<ImagePlus className="size-8 text-muted-foreground" />
									<p className="text-sm font-medium">
										Klik atau seret foto ke sini
									</p>
									<p className="text-xs text-muted-foreground">
										PNG, JPG, WEBP — maks. 5 MB per foto
									</p>
								</button>

								{/* Thumbnails */}
								{photos.length > 0 && (
									<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
										{photos.map((p, i) => (
											<div
												key={i}
												className="group relative aspect-video overflow-hidden rounded-lg bg-muted"
											>
												<img
													src={p.dataUrl}
													alt={p.file.name}
													className="h-full w-full object-cover"
												/>
												<button
													type="button"
													onClick={() => removePhoto(i)}
													className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground shadow opacity-0 transition group-hover:opacity-100"
												>
													<X className="size-3" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							{error ? (
								<Alert variant="destructive">
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							) : null}

							<Button
								type="submit"
								disabled={pending || !name || !type || !latitude || !longitude}
								className="mt-2"
							>
								{pending ? "Menyimpan…" : "Tambah Masjid"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
