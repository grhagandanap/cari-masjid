import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, User, MapPin, Phone, Award } from "lucide-react";
import { useAuth } from "#/hooks/use-auth.ts";
import { Button } from "#/components/ui/button.tsx";
import { getUserProfile, updateUserProfile } from "#/lib/server/profile.ts";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

interface ProfileData {
	id: string;
	name: string;
	email: string;
	image: string | null;
	address: string | null;
	phone: string | null;
	contributions: number;
}

function ProfilePage() {
	const { user, isPending } = useAuth();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [address, setAddress] = useState("");
	const [phone, setPhone] = useState("");

	useEffect(() => {
		if (!isPending && !user) {
			navigate({ to: "/" });
			return;
		}
		if (!isPending && user) {
			setLoading(true);
			getUserProfile()
				.then((data) => {
					setProfile(data);
					setName(data.name);
					setAddress(data.address ?? "");
					setPhone(data.phone ?? "");
				})
				.catch(() => setMessage("Gagal memuat profil."))
				.finally(() => setLoading(false));
		}
	}, [isPending, user, navigate]);

	async function handleSave(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setMessage(null);
		try {
			await updateUserProfile({
				data: {
					name: name.trim(),
					address: address.trim() || null,
					phone: phone.trim() || null,
				},
			});
			setMessage("Profil berhasil diperbarui.");
		} catch {
			setMessage("Gagal menyimpan perubahan.");
		} finally {
			setSaving(false);
		}
	}

	if (isPending || loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
				<p className="text-muted-foreground">Gagal memuat profil.</p>
				<Button asChild variant="outline" className="mt-4 gap-2">
					<Link to="/dashboard">
						<ArrowLeft className="size-4" />
						Kembali
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<main className="mx-auto w-full max-w-xl px-4 py-8">
			<div className="mb-6 flex items-center gap-2">
				<Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
					<Link to="/dashboard">
						<ArrowLeft className="size-4" />
						Kembali
					</Link>
				</Button>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
				<div className="mb-6 flex items-center gap-4">
					<div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold">
						{profile.name.charAt(0).toUpperCase()}
					</div>
					<div>
						<h1 className="text-xl font-bold">{profile.name}</h1>
						<p className="text-sm text-muted-foreground">{profile.email}</p>
					</div>
				</div>

				{/* Contribution badge */}
				<div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
					<Award className="size-5 text-emerald-600 dark:text-emerald-400" />
					<div>
						<p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
							{profile.contributions} Kontribusi
						</p>
						<p className="text-xs text-emerald-700 dark:text-emerald-400">
							{profile.contributions === 0
								? "Mulai tambahkan masjid untuk berkontribusi!"
								: profile.contributions === 1
									? "Terima kasih atas kontribusi Anda!"
									: "Terima kasih atas kontribusi Anda!"}
						</p>
					</div>
				</div>

				<form onSubmit={handleSave} className="space-y-4">
					<div>
						<label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<User className="size-3.5" />
							Nama Lengkap
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
							placeholder="Nama lengkap"
							required
						/>
					</div>

					<div>
						<label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<MapPin className="size-3.5" />
							Alamat
						</label>
						<textarea
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
							placeholder="Alamat lengkap"
							rows={3}
						/>
					</div>

					<div>
						<label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<Phone className="size-3.5" />
							Nomor Telepon
						</label>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
							placeholder="Nomor telepon"
						/>
					</div>

					{message && (
						<p
							className={`text-sm ${
								message.includes("berhasil")
									? "text-emerald-600"
									: "text-destructive"
							}`}
						>
							{message}
						</p>
					)}

					<Button type="submit" className="w-full gap-2" disabled={saving}>
						<Save className="size-4" />
						{saving ? "Menyimpan..." : "Simpan Perubahan"}
					</Button>
				</form>
			</div>
		</main>
	);
}
