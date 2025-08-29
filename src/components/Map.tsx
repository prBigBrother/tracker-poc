'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
	userLocation: { lat: number; lng: number; source?: 'gps' | 'ip'; accuracy?: number } | null;
	isTracking: boolean;
}

export default function Map({ userLocation, isTracking }: MapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.Marker | null>(null);
	const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
	const [mapLoaded, setMapLoaded] = useState(false);

	// Get marker icon based on location source
	const getMarkerIcon = (source?: string) => {
		const baseIcon = {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 8,
			strokeColor: '#ffffff',
			strokeWeight: 2,
		};

		switch (source) {
			case 'gps':
				return {
					...baseIcon,
					fillColor: '#4285F4', // Blue for GPS
					fillOpacity: 1,
				};
			case 'ip':
				return {
					...baseIcon,
					fillColor: '#9C27B0', // Purple for IP
					fillOpacity: 0.8,
					scale: 6, // Smaller for less accurate
				};
			default:
				return {
					...baseIcon,
					fillColor: '#4285F4',
					fillOpacity: 1,
				};
		}
	};

	// Get marker title based on location source
	const getMarkerTitle = (source?: string) => {
		switch (source) {
			case 'gps':
				return 'Your GPS Location';
			case 'ip':
				return 'Your Approximate Location (IP)';
			default:
				return 'Your Location';
		}
	};

	useEffect(() => {
		const initMap = async () => {
			if (!mapRef.current) return;

			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

			if (!apiKey) {
				console.error('Google Maps API key is missing');
				setMapLoaded(false);
				return;
			}

			const loader = new Loader({
				apiKey,
				version: 'weekly',
				libraries: ['places'],
			});

			try {
				const { Map } = await loader.importLibrary('maps');

				const mapOptions: google.maps.MapOptions = {
					center: userLocation || { lat: 40.7128, lng: -74.006 }, // Default to NYC
					zoom: 15,
					mapTypeControl: true,
					streetViewControl: true,
					fullscreenControl: true,
					zoomControl: true,
					gestureHandling: 'greedy', // Better mobile handling
					zoomControlOptions: {
						position: google.maps.ControlPosition.RIGHT_CENTER,
					},
					mapTypeControlOptions: {
						style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
						position: google.maps.ControlPosition.TOP_LEFT,
					},
					streetViewControlOptions: {
						position: google.maps.ControlPosition.LEFT_BOTTOM,
					},
					fullscreenControlOptions: {
						position: google.maps.ControlPosition.TOP_RIGHT,
					},
					styles: [
						{
							featureType: 'poi',
							stylers: [{ visibility: 'off' }],
						},
					],
				};

				const map = new Map(mapRef.current, mapOptions);
				mapInstanceRef.current = map;

				// Create user location marker if location is available
				if (userLocation) {
					const marker = new google.maps.Marker({
						position: userLocation,
						map: map,
						title: getMarkerTitle(userLocation.source),
						icon: getMarkerIcon(userLocation.source),
					});
					markerRef.current = marker;

					// Add accuracy circle for GPS locations
					if (userLocation.source === 'gps' && userLocation.accuracy) {
						const circle = new google.maps.Circle({
							strokeColor: '#4285F4',
							strokeOpacity: 0.3,
							strokeWeight: 1,
							fillColor: '#4285F4',
							fillOpacity: 0.1,
							map: map,
							center: userLocation,
							radius: userLocation.accuracy,
						});
						accuracyCircleRef.current = circle;
					}
				}

				setMapLoaded(true);
			} catch (error) {
				console.error('Error loading Google Maps:', error);
			}
		};

		initMap();
	}, []);

	// Update marker position when userLocation changes
	useEffect(() => {
		if (mapLoaded && userLocation && mapInstanceRef.current) {
			// Create marker if it doesn't exist
			if (!markerRef.current) {
				const marker = new google.maps.Marker({
					position: userLocation,
					map: mapInstanceRef.current,
					title: getMarkerTitle(userLocation.source),
					icon: getMarkerIcon(userLocation.source),
				});
				markerRef.current = marker;
			} else {
				// Update existing marker
				markerRef.current.setPosition(userLocation);
				markerRef.current.setIcon(getMarkerIcon(userLocation.source));
				markerRef.current.setTitle(getMarkerTitle(userLocation.source));
			}

			// Update accuracy circle
			if (accuracyCircleRef.current) {
				accuracyCircleRef.current.setMap(null); // Remove old circle
			}

			if (userLocation.source === 'gps' && userLocation.accuracy) {
				const circle = new google.maps.Circle({
					strokeColor: '#4285F4',
					strokeOpacity: 0.3,
					strokeWeight: 1,
					fillColor: '#4285F4',
					fillOpacity: 0.1,
					map: mapInstanceRef.current,
					center: userLocation,
					radius: userLocation.accuracy,
				});
				accuracyCircleRef.current = circle;
			}

			// Always center map on new location point
			mapInstanceRef.current.panTo(userLocation);
		}
	}, [userLocation, mapLoaded]);

	return (
		<div className="w-full h-full relative">
			<div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" style={{ minHeight: '300px' }} />

			{/* Location Source Legend */}
			{mapLoaded && userLocation && (
				<div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
					<div className="text-sm font-medium text-gray-800 mb-2">Location Source</div>
					<div className="space-y-1 text-xs">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-blue-500"></div>
							<span>GPS</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-purple-500"></div>
							<span>IP Address</span>
						</div>
					</div>
				</div>
			)}

			{!mapLoaded && (
				<div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
					<div className="text-center">
						{!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
							<>
								<div className="text-red-500 text-4xl mb-4">⚠️</div>
								<p className="text-red-600 font-medium">Google Maps API Key Missing</p>
								<p className="text-sm text-gray-500 mt-2">Please add your API key to .env.local</p>
							</>
						) : (
							<>
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
								<p className="text-gray-600">Loading map...</p>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
