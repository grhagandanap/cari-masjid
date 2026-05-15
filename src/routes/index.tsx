import { useEffect } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Compass, Sparkles, HandHeart } from "lucide-react";
import { useAuth } from "#/hooks/use-auth.ts";
import { Button } from "#/components/ui/button.tsx";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { user, isPending } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isPending && user) {
			navigate({ to: "/dashboard" });
		}
	}, [isPending, user, navigate]);

	if (isPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
			</div>
		);
	}

	return <Landing />;
}

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
			desc: "Lihat area wudhu, parkir, aksesibilitas dan lainnya sebelum Anda tiba.",
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
							className="bg-white px-8 font-semibold text-emerald-700 shadow-md hover:bg-emerald-50 hover:shadow-lg"
						>
							<Link to="/auth/register">Buat akun gratis</Link>
						</Button>
						<Button
							asChild
							size="lg"
							className="border-2 border-white bg-white/15 px-8 font-medium text-white backdrop-blur-sm hover:bg-white/25 hover:border-white/80"
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
