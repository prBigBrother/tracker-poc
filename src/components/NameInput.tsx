'use client';

interface NameInputProps {
	name: string;
	onNameChange: (name: string) => void;
}

export default function NameInput({ name, onNameChange }: NameInputProps) {
	return (
		<div className="p-4 bg-white rounded-lg shadow-lg">
			<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
				Your Name
			</label>
			<input
				id="name"
				type="text"
				value={name}
				onChange={(e) => onNameChange(e.target.value)}
				placeholder="Enter your name"
				className="
          w-full px-4 py-2 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          outline-none transition-colors duration-200
          text-gray-900 placeholder-gray-500
        "
			/>
			{name && (
				<p className="mt-2 text-sm text-gray-600">Welcome, {name}! Your location will be tracked on the map.</p>
			)}
		</div>
	);
}
