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
				setError(signErr.message ?? "Could not create your account.");
				return;
			}

			await navigate({ to: "/auth/login", search: { redirect: undefined } });
		} catch {
			setError("Something went wrong. Try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create your account</CardTitle>
					<CardDescription>
						Join CariMasjid to add and discover mosques.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col gap-4" onSubmit={onSubmit}>
						<div className="flex flex-col gap-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								autoComplete="name"
								required
								value={name}
								onChange={(ev) => setName(ev.target.value)}
								placeholder="Your name"
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
							<Label htmlFor="password">Password</Label>
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
								At least 8 characters.
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
							{pending ? "Creating account…" : "Create account"}
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							to="/auth/login"
							className="font-medium underline-offset-2 hover:underline"
							search={{ redirect: undefined }}
						>
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
