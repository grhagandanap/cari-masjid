import {
	Car,
	Droplets,
	MapPin,
	Users,
	Bath,
	Accessibility,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";

interface Facilities {
	hasWudhuArea: boolean;
	hasSeparateMenWomen: boolean;
	hasParking: boolean;
	isWheelchairAccessible: boolean;
	hasRestrooms: boolean;
}

interface MosqueCardProps {
	id: string;
	name: string;
	distance?: number;
	facilities: Facilities;
	thumbnailUrl?: string | null;
}

export function MosqueCard({
	name,
	distance,
	facilities,
	thumbnailUrl,
}: MosqueCardProps) {
	const activeFacilities = [
		{ icon: Droplets, label: "Wudhu", active: facilities.hasWudhuArea },
		{ icon: Users, label: "Gender sep.", active: facilities.hasSeparateMenWomen },
		{ icon: Car, label: "Parking", active: facilities.hasParking },
		{ icon: Accessibility, label: "Accessible", active: facilities.isWheelchairAccessible },
		{ icon: Bath, label: "Restroom", active: facilities.hasRestrooms },
	].filter((f) => f.active);

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			{thumbnailUrl ? (
				<div className="h-40 w-full overflow-hidden bg-muted">
					<img
						src={thumbnailUrl}
						alt={name}
						className="h-full w-full object-cover"
					/>
				</div>
			) : null}
			<CardHeader className="pb-2">
				<CardTitle className="text-lg">{name}</CardTitle>
				{distance !== undefined ? (
					<CardDescription className="flex items-center gap-1">
						<MapPin className="size-3.5" />
						{distance.toFixed(1)} km away
					</CardDescription>
				) : null}
			</CardHeader>
			<CardContent>
				{activeFacilities.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{activeFacilities.map((f) => (
							<span
								key={f.label}
								className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
							>
								<f.icon className="size-3" />
								{f.label}
							</span>
						))}
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						No facility info available.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
