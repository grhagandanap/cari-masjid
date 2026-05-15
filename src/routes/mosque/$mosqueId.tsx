import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DirectionsView } from "#/components/DirectionsView.tsx";
import { getMosqueDetails } from "#/lib/server/mosques.ts";

export const Route = createFileRoute("/mosque/$mosqueId")({
	validateSearch: (search: Record<string, unknown>) => ({
		directions: search.directions === true || search.directions === "true",
	}),
	loader: async ({ params }) => {
		const mosque = await getMosqueDetails({ data: { mosqueId: params.mosqueId } });
		return { mosque };
	},
	component: MosqueDirectionsPage,
});

function MosqueDirectionsPage() {
	const { mosque } = Route.useLoaderData();
	const { directions } = Route.useSearch();
	const navigate = useNavigate();

	useEffect(() => {
		if (!directions) {
			navigate({ to: "/" });
		}
	}, [directions, navigate]);

	if (!mosque || !directions) {
		return null;
	}

	return (
		<DirectionsView
			mosqueName={mosque.name}
			mosqueAddress={mosque.address}
			lat={mosque.latitude}
			lng={mosque.longitude}
			onClose={() => navigate({ to: "/" })}
		/>
	);
}
