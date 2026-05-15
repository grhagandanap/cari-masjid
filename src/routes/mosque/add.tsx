import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Map, Marker } from "pigeon-maps";
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
	hasWuduArea: boolean;
	hasSeparateMenWomen: boolean;
	hasParking: boolean;
	isWheelchairAccessible: boolean;
	hasRestrooms: boolean;
}

const facilityOptions: FacilityOption[] = [
	{ id: "wudu", label: "Wudu Area", key: "hasWuduArea" },
	{ id: "gender", label: "Separate Men/Women", key: "hasSeparateMenWomen" },
	{ id: "parking", label: "Parking", key: "hasParking" },
	{ id: "accessible", label: "Wheelchair Accessible", key: "isWheelchairAccessible" },
	{ id: "restroom", label: "Restrooms", key: "hasRestrooms" },
];

function AddMosquePage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [type, setType] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");
	const [address, setAddress] = useState("");
	const [website, setWebsite] = useState("");
	const [contact, setContact] = useState("");
	const [facilities, setFacilities] = useState<FacilityState>({
		hasWuduArea: false,
		hasSeparateMenWomen: false,
		hasParking: false,
		isWheelchairAccessible: false,
		hasRestrooms: false,
	});
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	function toggleFacility(key: keyof FacilityState) {
		setFacilities((prev) => ({ ...prev, [key]: !prev[key] }));
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);

		try {
			const lat = parseFloat(latitude);
			const lng = parseFloat(longitude);

			if (Number.isNaN(lat) || Number.isNaN(lng)) {
				setError("Latitude and Longitude must be valid numbers.");
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
					...facilities,
				},
			});

			await navigate({ to: `/mosque/${mosque.id}` });
		} catch {
			setError("Failed to create mosque. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex flex-col px-4 py-12">
			<div className="mx-auto w-full max-w-2xl">
				<h1 className="text-3xl font-bold">Add a Mosque</h1>
				<p className="mt-2 text-muted-foreground">
					Contribute to the community by adding a new mosque.
				</p>

				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Mosque Information</CardTitle>
						<CardDescription>
							Fill in the details below. Fields marked with * are required.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="flex flex-col gap-5" onSubmit={onSubmit}>
							{/* Name */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="name">
									Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="name"
									required
									value={name}
									onChange={(ev) => setName(ev.target.value)}
									placeholder="e.g. Masjid Al-Haram"
								/>
							</div>

							{/* Type */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="type">
									Type <span className="text-destructive">*</span>
								</Label>
								<Input
									id="type"
									required
									value={type}
									onChange={(ev) => setType(ev.target.value)}
									placeholder="e.g. Jami, Musalla, Surau"
								/>
							</div>

							{/* Coordinates */}
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-2">
									<Label htmlFor="latitude">
										Latitude <span className="text-destructive">*</span>
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
										Longitude <span className="text-destructive">*</span>
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

							{/* Map Pin Dropper */}
							<div className="flex flex-col gap-2">
								<Label>Drop the pin on the map</Label>
								<Map
									center={useMemo(() => {
										const lat = parseFloat(latitude);
										const lng = parseFloat(longitude);
										if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
											return [lat, lng] as [number, number];
										}
										return [-6.2088, 106.8456] as [number, number];
									}, [latitude, longitude])}
									zoom={13}
									height={280}
									onClick={({ latLng }) => {
										const [lat, lng] = latLng;
										setLatitude(String(lat));
										setLongitude(String(lng));
									}}
								>
									{(latitude && longitude) ? (
										<Marker
											anchor={[
												parseFloat(latitude),
												parseFloat(longitude),
											]}
											width={32}
											height={32}
										/>
									) : null}
								</Map>
								<p className="text-xs text-muted-foreground">
									Click anywhere on the map to set the location, or type coordinates manually.
								</p>
							</div>

							{/* Address */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="address">Address</Label>
								<Textarea
									id="address"
									value={address}
									onChange={(ev) => setAddress(ev.target.value)}
									placeholder="Full street address"
								/>
							</div>

							{/* Website */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="website">Website</Label>
								<Input
									id="website"
									type="url"
									value={website}
									onChange={(ev) => setWebsite(ev.target.value)}
									placeholder="https://example.com"
								/>
							</div>

							{/* Contact */}
							<div className="flex flex-col gap-2">
								<Label htmlFor="contact">Contact</Label>
								<Input
									id="contact"
									type="tel"
									value={contact}
									onChange={(ev) => setContact(ev.target.value)}
									placeholder="Phone number"
								/>
							</div>

							{/* Facilities */}
							<div className="flex flex-col gap-3">
								<Label>Facilities</Label>
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
								{pending ? "Submitting…" : "Add Mosque"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
