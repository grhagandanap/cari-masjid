export function ListSkeleton() {
	return (
		<ul className="divide-y divide-border">
			{[0, 1, 2, 3, 4].map((i) => (
				<li key={i} className="flex items-start gap-3 px-4 py-3">
					<div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
					<div className="flex-1 space-y-2">
						<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
					</div>
				</li>
			))}
		</ul>
	);
}
