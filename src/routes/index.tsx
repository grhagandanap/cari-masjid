import { Link, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/hooks/use-auth.ts";
import { Button } from "#/components/ui/button.tsx";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { user, isPending } = useAuth();
	const isAuthenticated = !!user;

	return (
		<div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
			<h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
				Find Nearby Mosques Easily
			</h1>
			<p className="mt-6 max-w-2xl text-xl text-muted-foreground">
				Discover mosques around you, check available facilities, get directions,
				and contribute by adding new ones to help the community.
			</p>

			{isPending ? (
				<div className="mt-10 h-10 w-32 animate-pulse rounded-md bg-muted" />
			) : !isAuthenticated ? (
				<div className="mt-10 flex flex-col gap-3 sm:flex-row">
					<Button asChild size="lg">
						<Link to="/auth/login" search={{ redirect: undefined }}>Login</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link to="/auth/register">Register</Link>
					</Button>
				</div>
			) : null}
		</div>
	);
}
