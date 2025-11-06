# Flutter App Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   flutter pub get
   ```

2. **Start your Next.js backend**:
   ```bash
   cd your-nextjs-project
   npm run dev
   ```
   Backend will run on `http://localhost:9002`

3. **Run the Flutter app**:
   ```bash
   # For Android emulator
   flutter run
   
   # For physical device (replace with your IP)
   flutter run --dart-define=API_BASE_URL=http://192.168.1.100:9002/api
   ```

## Configuration

The app is pre-configured with your environment variables:

- **API URL**: `http://10.0.2.2:9002/api` (Android emulator)
- **Cloudinary**: Your cloud name and API keys
- **UPI ID**: `dasjojo7-1@okicici`

## Demo Accounts

- **Admin**: `admin@bhinnashad.com`
- **Manager**: `manager@bhinnashad.com`
- **Waiter**: `arjun@bhinnashad.com`
- **Kitchen**: `kitchen@bhinnashad.com`

Password for all: `123456`

## Features Working

✅ **Authentication** - Login/signup with JWT
✅ **Role-based dashboards** - Admin, Manager, Waiter, Kitchen
✅ **Order management** - Create, approve, track orders
✅ **Menu management** - Add, edit, delete menu items
✅ **Table management** - Visual table status grid
✅ **QR code payments** - UPI payment QR codes
✅ **Real-time updates** - Live order status
✅ **Image uploads** - Cloudinary integration
✅ **Reports** - Revenue and order analytics

## Architecture

- **State Management**: Riverpod
- **Navigation**: GoRouter
- **HTTP Client**: Dio
- **Local Storage**: Hive
- **Models**: Manual JSON serialization (no code generation needed)

## Troubleshooting

### Network Issues
- **Android Emulator**: Use `10.0.2.2` instead of `localhost`
- **Physical Device**: Use your computer's IP address
- **iOS Simulator**: Use `localhost` or `127.0.0.1`

### Backend Connection
Make sure your Next.js backend is running on port 9002 with CORS enabled for mobile requests.

### Build Issues
If you encounter build issues, run:
```bash
flutter clean
flutter pub get
flutter run
```

## Production Build

```bash
# Android APK
flutter build apk --release --dart-define=API_BASE_URL=https://your-api.com/api

# Android App Bundle
flutter build appbundle --release --dart-define=API_BASE_URL=https://your-api.com/api
```

## Next Steps

1. Test all features with your backend
2. Customize UI colors/branding if needed
3. Add push notifications (optional)
4. Deploy to app stores

The app is ready to use with your existing backend infrastructure!