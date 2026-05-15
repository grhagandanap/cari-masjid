import { Link, createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
});

function LoginPage() {
	const navigate = useNavigate();
	const search = useSearch({ from: "/auth/login" });
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);

		try {
			const { error: signErr } = await authClient.signIn.email({
				email,
				password,
			});

			if (signErr) {
				setError(signErr.message ?? "Email atau kata sandi salah.");
				return;
			}

			const redirectTo =
				search.redirect && search.redirect.startsWith("/")
					? search.redirect
					: "/";
			await navigate({ to: redirectTo });
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
					<CardTitle>Masuk</CardTitle>
					<CardDescription>
						Masukkan email dan kata sandi untuk mengakses akun Anda.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
								autoComplete="current-password"
								required
								value={password}
								onChange={(ev) => setPassword(ev.target.value)}
							/>
						</div>

						{error ? (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						) : null}

						<Button
							type="submit"
							disabled={pending || !email || !password}
							className="mt-2"
						>
							{pending ? "Masuk…" : "Masuk"}
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						Belum punya akun?{" "}
						<Link
							to="/auth/register"
							className="font-medium underline-offset-2 hover:underline"
						>
							Daftar
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
