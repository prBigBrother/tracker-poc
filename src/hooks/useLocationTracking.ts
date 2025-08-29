import { useState, useEffect, useCallback, useRef } from 'react';

interface Location {
	lat: number;
	lng: number;
	accuracy?: number;
	timestamp?: number;
	source?: 'gps' | 'ip';
	address?: string;
}

interface LocationTrackingState {
	userLocation: Location | null;
	isTracking: boolean;
	permissionStatus: 'granted' | 'denied' | 'prompt' | null;
	locationError: string | null;
	watchId: number | null;
	gpsSignalStrength: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
}

export function useLocationTracking() {
	const [state, setState] = useState<LocationTrackingState>({
		userLocation: null,
		isTracking: false,
		permissionStatus: null,
		locationError: null,
		watchId: null,
		gpsSignalStrength: 'none',
	});

	const watchIdRef = useRef<number | null>(null);
	const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Check if geolocation is supported
	const isGeolocationSupported = 'geolocation' in navigator;

	// Check if we're in a secure context (required for geolocation)
	const isSecureContext =
		typeof window !== 'undefined' &&
		(window.location.protocol === 'https:' ||
			window.location.hostname === 'localhost' ||
			window.location.hostname === '127.0.0.1');

	// Get IP-based approximate location
	const getIPLocation = useCallback(async (): Promise<Location | null> => {
		try {
			const response = await fetch('https://ipapi.co/json/');
			const data = await response.json();

			if (data.latitude && data.longitude) {
				return {
					lat: data.latitude,
					lng: data.longitude,
					accuracy: 5000, // IP location is typically accurate to ~5km
					timestamp: Date.now(),
					source: 'ip',
					address: `${data.city || ''}, ${data.country_name || ''}`.trim(),
				};
			}
		} catch (error) {
			console.warn('Failed to get IP location:', error);
		}
		return null;
	}, []);

	// Determine GPS signal strength based on accuracy
	const getGPSSignalStrength = useCallback((accuracy?: number): 'excellent' | 'good' | 'fair' | 'poor' | 'none' => {
		if (!accuracy) return 'none';
		if (accuracy <= 5) return 'excellent';
		if (accuracy <= 20) return 'good';
		if (accuracy <= 100) return 'fair';
		return 'poor';
	}, []);

	// Get current permission status
	const checkPermissionStatus = useCallback(async () => {
		if (!isGeolocationSupported) {
			setState((prev) => ({
				...prev,
				permissionStatus: 'denied',
				locationError: 'Geolocation is not supported by this browser',
			}));
			return;
		}

		if (!isSecureContext) {
			setState((prev) => ({
				...prev,
				permissionStatus: 'denied',
				locationError: 'Geolocation requires HTTPS. Please use HTTPS or localhost.',
			}));
			return;
		}

		try {
			// Check if permissions API is available
			if ('permissions' in navigator) {
				const result = await navigator.permissions.query({ name: 'geolocation' });
				setState((prev) => ({
					...prev,
					permissionStatus: result.state as 'granted' | 'denied' | 'prompt',
				}));

				// Listen for permission changes
				result.addEventListener('change', () => {
					setState((prev) => ({
						...prev,
						permissionStatus: result.state as 'granted' | 'denied' | 'prompt',
					}));
				});
			} else {
				// Fallback for browsers without permissions API - try to get location
				setState((prev) => ({
					...prev,
					permissionStatus: 'prompt',
				}));
			}
		} catch (error) {
			console.error('Error checking permission status:', error);
			// If permissions API fails, still allow trying geolocation
			setState((prev) => ({
				...prev,
				permissionStatus: 'prompt',
			}));
		}
	}, [isGeolocationSupported, isSecureContext]);

	// Get single location reading with mobile optimization
	const getCurrentLocation = useCallback((): Promise<Location> => {
		return new Promise((resolve, reject) => {
			if (!isGeolocationSupported) {
				reject(new Error('Geolocation is not supported'));
				return;
			}

			if (!isSecureContext) {
				reject(new Error('Geolocation requires HTTPS'));
				return;
			}

			console.log('Requesting location with mobile-optimized settings...');

			navigator.geolocation.getCurrentPosition(
				(position) => {
					console.log('Location received:', position.coords);
					const location: Location = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						accuracy: position.coords.accuracy,
						timestamp: position.timestamp,
						source: 'gps',
					};

					const signalStrength = getGPSSignalStrength(position.coords.accuracy);

					setState((prev) => ({
						...prev,
						gpsSignalStrength: signalStrength,
					}));

					resolve(location);
				},
				(error) => {
					console.error('Geolocation error:', error);
					let errorMessage = 'Unable to retrieve location';
					switch (error.code) {
						case error.PERMISSION_DENIED:
							errorMessage =
								'Location access denied. Please allow location access in your browser settings.';
							break;
						case error.POSITION_UNAVAILABLE:
							errorMessage = 'Location unavailable. Please check your GPS/network settings.';
							break;
						case error.TIMEOUT:
							errorMessage = 'Location request timed out. Please try again.';
							break;
						default:
							errorMessage = `Location error (${error.code}): ${error.message}`;
					}
					reject(new Error(errorMessage));
				},
				{
					enableHighAccuracy: true, // Essential for mobile GPS
					timeout: 30000, // Increased timeout for mobile GPS
					maximumAge: 300000, // Accept cached position up to 5 minutes
				}
			);
		});
	}, [isGeolocationSupported, isSecureContext, getGPSSignalStrength]);

	// Start location tracking with mobile optimization and retry logic
	const startTracking = useCallback(async () => {
		if (!isGeolocationSupported) {
			setState((prev) => ({
				...prev,
				locationError: 'Geolocation is not supported by this browser',
			}));
			return;
		}

		if (!isSecureContext) {
			setState((prev) => ({
				...prev,
				locationError: 'Geolocation requires HTTPS. Please use HTTPS or localhost.',
			}));
			return;
		}

		try {
			console.log('Starting location tracking...');
			setState((prev) => ({
				...prev,
				isTracking: true,
				locationError: null,
			}));

			// Get initial location with retry logic
			let initialLocation: Location;
			try {
				initialLocation = await getCurrentLocation();
				console.log('Initial location obtained:', initialLocation);
			} catch (error) {
				console.warn('Failed to get initial location, trying IP fallback...', error);

				// Try IP-based location as fallback
				const ipLocation = await getIPLocation();
				if (ipLocation) {
					initialLocation = ipLocation;
					console.log('Using IP-based approximate location:', ipLocation);
				} else {
					// If both GPS and IP fail, rethrow the original error
					throw error;
				}
			}

			setState((prev) => ({
				...prev,
				userLocation: initialLocation,
				permissionStatus: 'granted',
			}));

			// Start watching position with mobile-optimized settings
			const watchId = navigator.geolocation.watchPosition(
				(position) => {
					console.log('Location update received:', position.coords);
					const location: Location = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						accuracy: position.coords.accuracy,
						timestamp: position.timestamp,
						source: 'gps',
					};

					const signalStrength = getGPSSignalStrength(position.coords.accuracy);

					setState((prev) => ({
						...prev,
						userLocation: location,
						locationError: null,
						permissionStatus: 'granted',
						gpsSignalStrength: signalStrength,
					}));
				},
				(error) => {
					console.error('Watch position error:', error);
					let errorMessage = 'Location tracking error';
					switch (error.code) {
						case error.PERMISSION_DENIED:
							errorMessage = 'Location access denied. Please check your browser permissions.';
							setState((prev) => ({
								...prev,
								permissionStatus: 'denied',
								isTracking: false,
							}));
							break;
						case error.POSITION_UNAVAILABLE:
							errorMessage = 'GPS unavailable. Please check your location settings.';
							// Don't stop tracking, just show error
							break;
						case error.TIMEOUT:
							errorMessage = 'Location timeout. GPS signal may be weak.';
							// Don't stop tracking, just show error
							break;
						default:
							errorMessage = `Location error (${error.code}): ${error.message}`;
					}

					setState((prev) => ({
						...prev,
						locationError: errorMessage,
					}));
				},
				{
					enableHighAccuracy: true, // Essential for mobile GPS
					timeout: 30000, // Increased timeout for mobile GPS
					maximumAge: 60000, // Accept cached position up to 1 minute
				}
			);

			watchIdRef.current = watchId;
			setState((prev) => ({
				...prev,
				watchId,
			}));

			console.log('Location tracking started successfully, watchId:', watchId);
		} catch (error) {
			console.error('Failed to start tracking:', error);
			setState((prev) => ({
				...prev,
				isTracking: false,
				locationError: error instanceof Error ? error.message : 'Failed to start tracking',
			}));
		}
	}, [isGeolocationSupported, isSecureContext, getCurrentLocation, getIPLocation, getGPSSignalStrength]);

	// Stop location tracking
	const stopTracking = useCallback(() => {
		console.log('Stopping location tracking...');

		// Clear any retry timeouts
		if (retryTimeoutRef.current) {
			clearTimeout(retryTimeoutRef.current);
			retryTimeoutRef.current = null;
		}

		// Clear geolocation watch
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current);
			watchIdRef.current = null;
		}

		setState((prev) => ({
			...prev,
			isTracking: false,
			watchId: null,
		}));
	}, []);

	// Request initial location on mount
	const requestInitialLocation = useCallback(async () => {
		try {
			console.log('Requesting initial location...');
			const location = await getCurrentLocation();
			setState((prev) => ({
				...prev,
				userLocation: location,
				permissionStatus: 'granted',
			}));
		} catch (error) {
			console.warn('Failed to get initial location, trying IP fallback...', error);
			const ipLocation = await getIPLocation();
			if (ipLocation) {
				setState((prev) => ({
					...prev,
					userLocation: ipLocation,
					permissionStatus: 'granted',
				}));
			}
		}
	}, [getCurrentLocation, getIPLocation]);

	// Initialize permission status and request location on mount
	useEffect(() => {
		console.log('Initializing location tracking hook...');
		checkPermissionStatus();
		// Request location immediately when component mounts
		requestInitialLocation();
	}, [checkPermissionStatus, requestInitialLocation]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			console.log('Cleaning up location tracking...');

			// Clear any retry timeouts
			if (retryTimeoutRef.current) {
				clearTimeout(retryTimeoutRef.current);
			}

			// Clear geolocation watch
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current);
			}
		};
	}, []);

	return {
		userLocation: state.userLocation,
		isTracking: state.isTracking,
		permissionStatus: state.permissionStatus,
		locationError: state.locationError,
		gpsSignalStrength: state.gpsSignalStrength,
		startTracking,
		stopTracking,
		getIPLocation,
	};
}
