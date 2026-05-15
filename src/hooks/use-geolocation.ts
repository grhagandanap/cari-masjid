import { useState, useEffect } from "react";

interface Location {
	lat: number;
	lng: number;
}

interface UseGeolocationReturn {
	location: Location | null;
	error: string | null;
	isLoading: boolean;
}

export function useGeolocation(): UseGeolocationReturn {
	const [location, setLocation] = useState<Location | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!("geolocation" in navigator)) {
			setError("Geolocation is not supported by this browser.");
			setIsLoading(false);
			return;
		}

		const success = (position: GeolocationPosition) => {
			setLocation({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			});
			setIsLoading(false);
		};

		const failure = (err: GeolocationPositionError) => {
			setError(err.message);
			setIsLoading(false);
		};

		navigator.geolocation.getCurrentPosition(success, failure);
	}, []);

	return { location, error, isLoading };
}
