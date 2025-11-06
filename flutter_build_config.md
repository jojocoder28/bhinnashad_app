# Flutter Build Configuration

## Environment Variables

To configure the app for different environments, you can pass environment variables during build:

### Development Build
```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:9002/api --dart-define=ENVIRONMENT=development
```

### Production Build
```bash
flutter build apk --dart-define=API_BASE_URL=https://your-production-api.com/api --dart-define=ENVIRONMENT=production --dart-define=CLOUDINARY_CLOUD_NAME=your_cloud_name --dart-define=CLOUDINARY_API_KEY=your_api_key --dart-define=CLOUDINARY_API_SECRET=your_api_secret --dart-define=FALLBACK_UPI_ID=your_upi_id
```

## Available Environment Variables

- `API_BASE_URL`: Backend API base URL
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image uploads
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `FALLBACK_UPI_ID`: UPI ID for payment QR codes
- `ENVIRONMENT`: Environment (development/production)

## Network Configuration

### Android Emulator
- Use `http://10.0.2.2:9002/api` to access localhost from Android emulator
- Use `http://your-local-ip:9002/api` to access from physical device

### iOS Simulator
- Use `http://localhost:9002/api` for iOS simulator
- Use `http://your-local-ip:9002/api` to access from physical device

## Backend Setup

Make sure your Next.js backend is running with the provided environment variables:

```env
MONGODB_URI="mongodb+srv://marik:iwcqP1s38lXz6Izq@cluster0.heyuomr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="Swarnajit@123"
CLOUDINARY_CLOUD_NAME="drw148izx"
CLOUDINARY_API_KEY="248126434961473"
CLOUDINARY_API_SECRET="ftP0WnkLkKZ8gqe9h_eQkjZF3QQ"
NEXT_PUBLIC_FALLBACK_UPI_ID="dasjojo7-1@okicici"
```

Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:9002`