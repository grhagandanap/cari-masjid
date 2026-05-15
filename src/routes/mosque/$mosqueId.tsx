import { createFileRoute, useParams } from "@tanstack/react-router";
import { getMosqueDetails } from "#/lib/server/mosques.ts";

export const Route = createFileRoute("/mosque/$mosqueId")({
	loader: async ({ params }) => {
		const mosque = await getMosqueDetails({ data: { mosqueId: params.mosqueId } });
		return { mosque };
	},
	component: MosqueDetailsPage,
});

function MosqueDetailsPage() {
	const { mosqueId } = useParams({ from: "/mosque/$mosqueId" });
	const { mosque } = Route.useLoaderData();

	return (
		<div className="flex flex-col px-4 py-12">
			<div className="mx-auto w-full max-w-4xl">
				<h1 className="text-3xl font-bold">Mosque Details</h1>
				<p className="mt-2 text-muted-foreground">ID: {mosqueId}</p>
				{mosque ? (
					<div className="mt-6">
						<h2 className="text-2xl font-semibold">{mosque.name}</h2>
						<p className="mt-1 text-muted-foreground">{mosque.address}</p>
					</div>
				) : (
					<p className="mt-6 text-muted-foreground">Mosque not found.</p>
				)}
			</div>
		</div>
	);
}
