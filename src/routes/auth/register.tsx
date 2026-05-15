import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client.ts";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { Alert, AlertDescription } from "#/components/ui/alert.tsx";

export const Route = createFileRoute("/auth/register")({
	component: RegisterPage,
});

function RegisterPage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);

		try {
			const { error: signErr } = await authClient.signUp.email({
				name,
				email,
				password,
			});

			if (signErr) {
				setError(signErr.message ?? "Gagal membuat akun.");
				return;
			}

			await navigate({ to: "/auth/login", search: { redirect: undefined } });
		} catch {
			setError("Terjadi kesalahan. Coba lagi.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Buat Akun</CardTitle>
					<CardDescription>
						Bergabung dengan CariMasjid untuk menambahkan dan menemukan masjid.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col gap-4" onSubmit={onSubmit}>
						<div className="flex flex-col gap-2">
							<Label htmlFor="name">Nama</Label>
							<Input
								id="name"
								type="text"
								autoComplete="name"
								required
								value={name}
								onChange={(ev) => setName(ev.target.value)}
								placeholder="Nama Anda"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(ev) => setEmail(ev.target.value)}
								placeholder="you@example.com"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor="password">Kata Sandi</Label>
							<Input
								id="password"
								type="password"
								autoComplete="new-password"
								minLength={8}
								required
								value={password}
								onChange={(ev) => setPassword(ev.target.value)}
							/>
							<span className="text-xs text-muted-foreground">
								Minimal 8 karakter.
							</span>
						</div>

						{error ? (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						) : null}

						<Button
							type="submit"
							disabled={pending || !name || !email || !password}
							className="mt-2"
						>
							{pending ? "Membuat akun…" : "Buat Akun"}
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						Sudah punya akun?{" "}
						<Link
							to="/auth/login"
							className="font-medium underline-offset-2 hover:underline"
							search={{ redirect: undefined }}
						>
							Masuk
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
