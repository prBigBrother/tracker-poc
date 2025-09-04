export const metadata = {
  title: 'Offline • Location Tracker',
};

export default function OfflinePage() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold mb-2">You’re offline</h1>
        <p className="text-gray-600 mb-4">
          This page isn’t available right now. Check your connection and try again.
        </p>
        <div className="text-sm text-gray-500">
          The app will reconnect automatically when you’re back online.
        </div>
      </div>
    </main>
  );
}

