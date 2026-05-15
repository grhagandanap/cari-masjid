import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "#/lib/route-guard.ts";

export const Route = createFileRoute("/mosque/add")({
	beforeLoad: async () => {
		await requireAuth({ to: "/auth/login" });
	},
	component: AddMosquePage,
});

function AddMosquePage() {
	return (
		<div className="flex flex-col px-4 py-12">
			<div className="mx-auto w-full max-w-2xl">
				<h1 className="text-3xl font-bold">Add a Mosque</h1>
				<p className="mt-2 text-muted-foreground">
					Contribute to the community by adding a new mosque.
				</p>
			</div>
		</div>
	);
}
