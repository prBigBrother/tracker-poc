'use client';

interface ControlButtonsProps {
	isTracking: boolean;
	onStartTracking: () => void;
	onStopTracking: () => void;
	permissionStatus: 'granted' | 'denied' | 'prompt' | null;
	locationError: string | null;
}

export default function ControlButtons({
	isTracking,
	onStartTracking,
	onStopTracking,
	permissionStatus,
	locationError,
}: ControlButtonsProps) {
	const getButtonText = () => {
		if (permissionStatus === 'denied') return 'Location Access Denied';
		if (locationError) return 'Location Error';
		return isTracking ? 'Stop Tracking' : 'Start Tracking';
	};

	const getButtonColor = () => {
		if (permissionStatus === 'denied') return 'bg-red-500 hover:bg-red-600';
		if (locationError) return 'bg-orange-500 hover:bg-orange-600';
		return isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600';
	};

	const handleClick = () => {
		if (isTracking) {
			onStopTracking();
		} else {
			onStartTracking();
		}
	};

	const isDisabled = permissionStatus === 'denied';

	return (
		<div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-800">Location Tracking</h3>
				<div className="flex items-center gap-2">
					<div
						className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
					/>
					<span className="text-sm text-gray-600">{isTracking ? 'Active' : 'Inactive'}</span>
				</div>
			</div>

			{locationError && (
				<div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
					<p className="text-sm text-orange-800">{locationError}</p>
				</div>
			)}

			<button
				onClick={handleClick}
				disabled={isDisabled}
				className={`
          px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200
          ${getButtonColor()}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        `}
			>
				{getButtonText()}
			</button>

			{permissionStatus === 'prompt' && (
				<p className="text-sm text-gray-600 text-center">
					Click "Start Tracking" to request location permission
				</p>
			)}

			{permissionStatus === 'denied' && (
				<p className="text-sm text-red-600 text-center">
					Location access is required for tracking. Please enable it in your browser settings.
				</p>
			)}
		</div>
	);
}
