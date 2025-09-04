# Location Tracker - Real-time GPS Tracking App

A modern web application that tracks user location in real-time using Google Maps and displays it with a blue dot marker. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

-   🗺️ **Google Maps Integration**: Interactive map with real-time location display
-   📍 **Real-time Tracking**: Continuous location updates with blue dot marker
-   🔐 **Permission Management**: Proper geolocation permission handling
-   📱 **Cross-device Support**: Works on desktop, tablet, and mobile devices
-   🎯 **Accurate Positioning**: High-accuracy GPS with fallback support
-   🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
-   ⚡ **Real-time Updates**: Live location tracking with visual feedback
-   📦 **PWA Support**: Installable app with offline fallback page

## Prerequisites

Before running this application, you need:

1. **Google Maps API Key** - Get one from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. **Node.js** (v18 or higher)
3. **pnpm** package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
pnpm install
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the following APIs:
    - Maps JavaScript API
    - Geocoding API (optional)
4. Create credentials (API Key)
5. Restrict the API key for security:
    - Add your domain to HTTP referrers
    - Enable only the required APIs

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Create environment file
touch .env.local
```

Add your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. PWA Notes

- The app includes a web app manifest and a service worker (`public/sw.js`).
- Install prompts appear in supported browsers after the first successful load.
- An offline fallback page is available at `/offline` when the network is unavailable.
- In development, service workers work on `http://localhost` only; for other hosts use HTTPS.

## Usage

1. **Enter Your Name**: Fill in the name input field
2. **Request Location Permission**: Click "Start Tracking" to allow location access
3. **View Your Location**: Your position appears as a blue dot on the map
4. **Real-time Updates**: The map automatically follows your movement
5. **Stop Tracking**: Click "Stop Tracking" to end location monitoring

## Architecture

### Components

-   **`Map`**: Google Maps integration with location marker
-   **`ControlButtons`**: Start/stop tracking controls with status indicators
-   **`NameInput`**: User name input field
-   **`useLocationTracking`**: Custom hook for geolocation management

### Key Features

-   **Permission Handling**: Graceful handling of location permissions
-   **Error Management**: Comprehensive error handling for various scenarios
-   **Responsive Design**: Optimized for all screen sizes
-   **Performance**: Efficient location updates with proper cleanup
-   **Accessibility**: Proper ARIA labels and keyboard navigation

## Browser Support

Works on all modern browsers that support:

-   Geolocation API
-   ES6+ JavaScript features
-   CSS Grid and Flexbox

### Mobile Considerations

-   Optimized touch controls
-   Responsive map controls
-   Proper viewport handling
-   Battery-efficient location tracking

## Troubleshooting

### Common Issues

1. **"Location Access Denied"**

    - Check browser location permissions
    - Ensure HTTPS in production
    - Verify API key restrictions

2. **Map Not Loading**

    - Verify Google Maps API key
    - Check API key restrictions
    - Ensure Maps JavaScript API is enabled

3. **Location Not Updating**
    - Check device GPS settings
    - Verify location permissions
    - Try refreshing the page

### Development Tips

-   Use browser developer tools to monitor location permissions
-   Check console for API key errors
-   Test on actual mobile devices for best results

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure the following for production deployment:

-   HTTPS enabled (required for geolocation)
-   Environment variables properly configured
-   API key restrictions updated for production domain

## Security Notes

-   API keys are exposed to the client (necessary for Maps API)
-   Use API key restrictions to limit usage
-   Monitor API usage in Google Cloud Console
-   Consider implementing server-side API key management for sensitive operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use in your projects.
