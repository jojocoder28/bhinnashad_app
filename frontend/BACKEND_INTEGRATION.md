# Backend Integration Guide

This guide explains how the Flutter frontend connects to the Node.js backend.

## ✅ Integration Complete

The Flutter app is now fully integrated with the Node.js backend using the exact same database schema.

## Configuration

### Environment Files

Three environment files are provided:

1. **`.env`** - Default configuration (development)
2. **`.env.development`** - Development environment
3. **`.env.production`** - Production environment

### API Base URL Configuration

**For Android Emulator:**
```
API_BASE_URL=http://10.0.2.2:9002/api
```

**For iOS Simulator:**
```
API_BASE_URL=http://localhost:9002/api
```

**For Physical Device (same network):**
```
API_BASE_URL=http://192.168.1.100:9002/api
```
Replace `192.168.1.100` with your computer's IP address.

**For Production:**
```
API_BASE_URL=https://your-domain.com/api
```

## Updated Models

All models have been updated to match the Node.js backend schema:

### UserModel
- ✅ Uses `status` field ('pending' or 'approved')
- ✅ Supports roles: 'admin', 'manager', 'waiter', 'user'
- ✅ No timestamps (matches backend)

### MenuItemModel
- ✅ Includes `costOfGoods` field
- ✅ `ingredients` as array of objects with `{stockItemId, quantity}`
- ✅ Removed unnecessary fields

### OrderModel
- ✅ Includes `orderType` ('dine-in' or 'pickup')
- ✅ `timestamp` as String (ISO format)
- ✅ Status includes: 'pending', 'approved', 'prepared', 'served', 'cancelled', 'billed'
- ✅ Optional `tableNumber` for pickup orders

### New Models Added
- ✅ **TableModel** - Table management
- ✅ **BillModel** - Billing system
- ✅ **StockItemModel** - Inventory management

## API Service

The `ApiService` class provides all backend endpoints:

### Authentication
```dart
await apiService.login(email, password);
await apiService.signup(userData);
await apiService.getCurrentUser();
```

### Users
```dart
await apiService.getUsers();
await apiService.approveUser(userId);
await apiService.createUser(userData);
```

### Menu
```dart
await apiService.getMenuItems();
await apiService.createMenuItem(menuData);
await apiService.updateMenuItem(id, menuData);
```

### Orders
```dart
await apiService.getOrders(status: 'pending');
await apiService.createOrder(orderData);
await apiService.updateOrderStatus(id, 'approved');
await apiService.cancelOrder(id, reason);
```

### Tables
```dart
await apiService.getTables();
await apiService.updateTableStatus(id, 'occupied', waiterId: userId);
```

### Bills
```dart
await apiService.getBills();
await apiService.createBillForTable(tableNumber);
await apiService.markBillAsPaid(billId);
```

### Stock Management
```dart
await apiService.getStockItems();
await apiService.getSuppliers();
await apiService.getPurchaseOrders();
await apiService.recordStockUsage(usageData);
```

## Testing the Integration

### 1. Start the Backend
```bash
cd node_backend
npm run dev
```

Backend will run on `http://localhost:9002`

### 2. Configure Flutter App

Update `.env` with the correct API URL for your setup:
- Android Emulator: `http://10.0.2.2:9002/api`
- iOS Simulator: `http://localhost:9002/api`
- Physical Device: `http://YOUR_IP:9002/api`

### 3. Run Flutter App
```bash
cd frontend
flutter pub get
flutter run
```

### 4. Test Login

Use existing accounts:
- **Admin**: admin@bhinnashad.com / 123456
- **Manager**: manager@bhinnashad.com / 123456
- **Waiter**: arjun@bhinnashad.com / 123456

## Error Handling

The API service uses Dio for HTTP requests with automatic error handling:

```dart
try {
  final orders = await apiService.getOrders();
  // Handle success
} on DioException catch (e) {
  if (e.response?.statusCode == 401) {
    // Handle unauthorized
  } else if (e.response?.statusCode == 404) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Authentication Flow

1. User logs in via `apiService.login()`
2. Backend returns JWT token
3. Token is stored in `StorageService`
4. Token is added to all subsequent requests via Dio interceptor
5. On 401 error, user is redirected to login

## Network Configuration

### Android

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<application
    android:usesCleartextTraffic="true">
```

### iOS

Add to `ios/Runner/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Production Checklist

- [ ] Update `.env.production` with production API URL
- [ ] Enable HTTPS for production API
- [ ] Remove `usesCleartextTraffic` from Android manifest
- [ ] Remove `NSAllowsArbitraryLoads` from iOS Info.plist
- [ ] Test all API endpoints
- [ ] Implement proper error handling
- [ ] Add loading states
- [ ] Add offline support (optional)
- [ ] Test on physical devices
- [ ] Configure proper CORS on backend

## Troubleshooting

### Cannot connect to backend

**Android Emulator:**
- Use `10.0.2.2` instead of `localhost`
- Check if backend is running on port 9002
- Ensure `usesCleartextTraffic="true"` is set

**iOS Simulator:**
- Use `localhost` or `127.0.0.1`
- Check backend is running
- Ensure NSAppTransportSecurity is configured

**Physical Device:**
- Use your computer's IP address
- Ensure device and computer are on same network
- Check firewall settings

### 401 Unauthorized

- Token may have expired
- User needs to login again
- Check if token is being sent in headers

### 404 Not Found

- Check API endpoint URL
- Verify backend route exists
- Check for typos in endpoint path

## Support

For issues:
1. Check backend logs: `node_backend/` terminal
2. Check Flutter logs: `flutter run` terminal
3. Verify API endpoints in Postman
4. Check network inspector in Flutter DevTools
