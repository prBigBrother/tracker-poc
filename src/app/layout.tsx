import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import KeepAwake from '@/components/KeepAwake';
import ServiceWorker from '@/components/ServiceWorker';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Location Tracker - Real-time GPS Tracking',
    description:
        'Track your location in real-time on Google Maps with accurate GPS positioning',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    applicationName: 'Location Tracker',
    themeColor: '#0ea5e9',
    manifest: '/manifest.webmanifest',
    appleWebApp: {
        capable: true,
        title: 'Location Tracker',
        statusBarStyle: 'default',
    },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="light">
			<body className={`${geistSans.variable} ${geistSans.variable} antialiased bg-gray-50 text-gray-900`}>
				<KeepAwake />
				<ServiceWorker />
				{children}
			</body>
		</html>
	);
}
