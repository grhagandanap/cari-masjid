import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "#/components/ui/button.tsx";

export const Route = createFileRoute("/donasi")({
	component: DonasiPage,
});

function DonasiPage() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
				<Construction className="size-8" />
			</div>
			<h1 className="mt-6 text-2xl font-bold">Halaman Donasi</h1>
			<p className="mt-2 text-muted-foreground">Halaman sedang dikerjakan.</p>
			<Button asChild variant="outline" className="mt-8 gap-2">
				<Link to="/">
					<ArrowLeft className="size-4" />
					Kembali ke Beranda
				</Link>
			</Button>
		</div>
	);
}
