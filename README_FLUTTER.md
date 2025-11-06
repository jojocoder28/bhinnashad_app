# Bhinna Shad - Flutter Mobile App

A Flutter mobile application for the Bhinna Shad restaurant management system, converted from the original Next.js web application.

## Features

### Role-Based Dashboards
- **Admin**: System overview, user management, reports, and settings
- **Manager**: Order approval, menu management, live status monitoring, and reports
- **Waiter**: Table management, order creation, menu browsing, and billing with QR codes
- **Kitchen**: Real-time order queue and preparation tracking

### Key Functionality
- **Authentication**: JWT-based login/signup with role-based access control
- **Real-time Updates**: Live order status and restaurant monitoring
- **Order Management**: Complete order lifecycle from creation to billing
- **Menu Management**: Add, edit, and manage menu items (Manager/Admin)
- **Table Management**: Visual table status grid with availability tracking
- **QR Code Billing**: Generate UPI payment QR codes for customers
- **Reports**: Revenue analytics and order history

## Tech Stack

- **Framework**: Flutter 3.10+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **HTTP Client**: Dio with Retrofit
- **Local Storage**: Hive
- **Authentication**: JWT with automatic token refresh
- **UI**: Material Design 3 with custom theming

## Project Structure

```
lib/
├── core/
│   ├── app.dart                 # Main app widget
│   ├── constants/               # App constants and configuration
│   ├── models/                  # Data models (User, Order, MenuItem)
│   ├── router/                  # Navigation configuration
│   ├── services/                # API and storage services
│   └── theme/                   # App theming
├── features/
│   ├── auth/                    # Authentication (login/signup)
│   ├── dashboard/               # Role-based dashboards
│   └── splash/                  # Splash screen
└── main.dart                    # App entry point
```

## Getting Started

### Prerequisites
- Flutter SDK 3.10 or higher
- Dart SDK 3.0 or higher
- Android Studio / VS Code with Flutter extensions
- A running instance of the Bhinna Shad backend API

### Installation

1. **Clone and setup**:
   ```bash
   flutter pub get
   ```

2. **Configure environment**:
   The app is pre-configured with your environment variables. The `.env` file contains:
   ```env
   API_BASE_URL=http://10.0.2.2:9002/api
   CLOUDINARY_CLOUD_NAME=drw148izx
   CLOUDINARY_API_KEY=248126434961473
   CLOUDINARY_API_SECRET=ftP0WnkLkKZ8gqe9h_eQkjZF3QQ
   FALLBACK_UPI_ID=dasjojo7-1@okicici
   ENVIRONMENT=development
   ```

3. **Start your backend server**:
   Make sure your Next.js backend is running:
   ```bash
   cd your-nextjs-project
   npm run dev
   ```

4. **Run the Flutter app**:
   ```bash
   # For Android emulator (uses 10.0.2.2 to access localhost)
   flutter run
   
   # For physical device (replace with your local IP)
   flutter run --dart-define=API_BASE_URL=http://192.168.1.100:9002/api
   ```

### Demo Accounts

Use these accounts to test different roles:

- **Admin**: `admin@bhinnashad.com`
- **Manager**: `manager@bhinnashad.com`
- **Waiter**: `arjun@bhinnashad.com`
- **Kitchen**: `kitchen@bhinnashad.com`

Password for all accounts: `123456`

## Development

### Code Generation (Optional)
The app uses manual JSON serialization for simplicity. If you want to use code generation, see `setup_codegen.md` for instructions.

### Architecture

The app follows a feature-based architecture with:
- **Riverpod** for state management
- **Repository pattern** for data access
- **Clean architecture** principles
- **Separation of concerns** between UI, business logic, and data

### Key Providers
- `authProvider`: Manages authentication state
- `apiServiceProvider`: HTTP client configuration
- `storageServiceProvider`: Local data persistence

## API Integration

The app integrates with the existing Bhinna Shad REST API:
- Authentication endpoints (`/auth/login`, `/auth/signup`)
- Order management (`/orders/*`)
- Menu management (`/menu/*`)
- User management (`/users/*`)
- Reports (`/reports/*`)

## Customization

### Theming
Modify `lib/core/theme/app_theme.dart` to customize:
- Colors (Primary teal, accent gold, background gray)
- Typography (Poppins for headings, PT Sans for body)
- Component styles

### Adding Features
1. Create feature directory under `lib/features/`
2. Add providers for state management
3. Create UI components and pages
4. Update routing in `app_router.dart`

## Building for Production

### Android
```bash
flutter build apk --release
# or
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Notes

- The app maintains the same design language as the original web app
- All role-based functionality has been preserved
- Real-time features use WebSocket connections
- Local storage ensures offline capability for cached data
- The UI is optimized for mobile devices with touch-friendly interactions

## Future Enhancements

- Push notifications for order updates
- Offline mode with data synchronization
- Biometric authentication
- Multi-language support
- Dark theme support
- Advanced analytics and reporting