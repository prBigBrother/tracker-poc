"use client";
import Map from '@/components/Map';
import ControlButtons from '@/components/ControlButtons';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function Home() {
	const {
		userLocation,
		isTracking,
		permissionStatus,
		locationError,
		gpsSignalStrength,
		startTracking,
		stopTracking,
	} = useLocationTracking();


	const getSignalStrengthColor = (strength: string) => {
		switch (strength) {
			case 'excellent':
				return 'text-green-600';
			case 'good':
				return 'text-blue-600';
			case 'fair':
				return 'text-yellow-600';
			case 'poor':
				return 'text-orange-600';
			case 'none':
				return 'text-gray-500';
			default:
				return 'text-gray-500';
		}
	};

	const getSignalStrengthIcon = (strength: string) => {
		switch (strength) {
			case 'excellent':
				return '📶';
			case 'good':
				return '📶';
			case 'fair':
				return '📶';
			case 'poor':
				return '📶';
			case 'none':
				return '❌';
			default:
				return '❌';
		}
	};

	const getLocationSourceLabel = (source?: string) => {
		switch (source) {
			case 'gps':
				return 'GPS';
			case 'ip':
				return 'IP Address';
			default:
				return 'Unknown';
		}
	};

	return (
		<div>
			<div>

		
				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
					{/* Left Panel - Controls */}
					<div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
						<ControlButtons
							isTracking={isTracking}
							onStartTracking={startTracking}
							onStopTracking={stopTracking}
							permissionStatus={permissionStatus}
							locationError={locationError}
						/>

						{/* IP Location button removed. The hook still initializes with GPS or IP fallback automatically. */}

						{/* Location Info */}
						{userLocation && (
							<div className="p-4 bg-white rounded-lg shadow-lg">
								<h3 className="text-lg font-semibold text-gray-800 mb-3">Current Location</h3>
								<div className="space-y-3 text-sm">
									<div className="flex items-center justify-between">
										<span className="font-medium">Latitude:</span>
										<span className="font-mono">{userLocation.lat.toFixed(6)}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="font-medium">Longitude:</span>
										<span className="font-mono">{userLocation.lng.toFixed(6)}</span>
									</div>

									{/* Location Source */}
									<div className="flex items-center justify-between">
										<span className="font-medium">Source:</span>
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												userLocation.source === 'gps'
													? 'bg-green-100 text-green-800'
													: userLocation.source === 'ip'
													? 'bg-blue-100 text-blue-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{getLocationSourceLabel(userLocation.source)}
										</span>
									</div>

									{/* GPS Signal Strength */}
									{userLocation.source === 'gps' && (
										<div className="flex items-center justify-between">
											<span className="font-medium">GPS Signal:</span>
											<span
												className={`flex items-center gap-1 ${getSignalStrengthColor(
													gpsSignalStrength
												)}`}
											>
												{getSignalStrengthIcon(gpsSignalStrength)}
												<span className="capitalize">{gpsSignalStrength}</span>
											</span>
										</div>
									)}

									{/* Accuracy */}
									{userLocation.accuracy && (
										<div className="flex items-center justify-between">
											<span className="font-medium">Accuracy:</span>
											<span
												className={`font-mono ${
													userLocation.accuracy <= 20
														? 'text-green-600'
														: userLocation.accuracy <= 100
														? 'text-yellow-600'
														: 'text-orange-600'
												}`}
											>
												±{Math.round(userLocation.accuracy)}m
											</span>
										</div>
									)}

									{/* Address */}
									{userLocation.address && (
										<div className="pt-2 border-t border-gray-200">
											<div className="font-medium text-gray-700 mb-1">Address:</div>
											<div className="text-gray-600">{userLocation.address}</div>
										</div>
									)}

									{/* Timestamp */}
									{userLocation.timestamp && (
										<div className="pt-2 border-t border-gray-200">
											<div className="font-medium text-gray-700 mb-1">Last Updated:</div>
											<div className="text-gray-600 text-xs">
												{new Date(userLocation.timestamp).toLocaleString()}
											</div>
										</div>
									)}

									{/* User Name section removed */}
								</div>
							</div>
						)}

						{/* Debug Info - Only show in development */}
						{process.env.NODE_ENV === 'development' && (
							<div className="p-4 bg-gray-50 rounded-lg border">
								<h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h4>
								<div className="text-xs text-gray-600 space-y-1">
									<div>Permission: {permissionStatus || 'unknown'}</div>
									<div>Tracking: {isTracking ? 'Yes' : 'No'}</div>
									<div>GPS Signal: {gpsSignalStrength}</div>
									<div>Geolocation Supported: {'geolocation' in navigator ? 'Yes' : 'No'}</div>
									<div>
										Secure Context:{' '}
										{window.location.protocol === 'https:' ||
										window.location.hostname === 'localhost'
											? 'Yes'
											: 'No'}
									</div>
									<div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
									{locationError && <div className="text-red-600">Error: {locationError}</div>}
								</div>
							</div>
						)}
					</div>

					{/* Right Panel - Map */}
					<div className="lg:col-span-2 order-1 lg:order-2">
						<div className="bg-white rounded-lg shadow-lg p-3 lg:p-4">
							<h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-3 lg:mb-4">Map View</h2>
							<div className="h-80 sm:h-96 lg:h-[500px] xl:h-[600px]">
								<Map userLocation={userLocation} isTracking={isTracking} />
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center text-sm text-gray-500">
					<p>
						This app uses Google Maps to display your location. Make sure to allow location access for full
						functionality.
					</p>
				</div>
			</div>
		</div>
	);
}
