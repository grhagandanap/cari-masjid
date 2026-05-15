export interface NearbyMosque {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	address: string | null;
	website: string | null;
	contact: string | null;
	type: string;
	hasWudhuArea: boolean;
	hasSeparateMenWomen: boolean;
	hasParking: boolean;
	isWheelchairAccessible: boolean;
	hasRestrooms: boolean;
	distance: number;
}
