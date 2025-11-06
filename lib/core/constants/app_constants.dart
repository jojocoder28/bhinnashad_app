class AppConstants {
  // Storage boxes
  static const String userBox = 'user_box';
  static const String settingsBox = 'settings_box';
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userDataKey = 'user_data';
  static const String themeKey = 'theme_mode';
  
  // API endpoints - Update this to match your backend server
  static const String baseUrl = 'http://10.0.2.2:9002/api'; // For Android emulator
  // static const String baseUrl = 'http://localhost:9002/api'; // For iOS simulator
  // static const String baseUrl = 'https://your-production-api.com/api'; // For production
  
  // Colors
  static const int primaryTeal = 0xFF008080;
  static const int backgroundGray = 0xFFE0E0E0;
  static const int accentGold = 0xFFFFD700;
  
  // User roles
  static const String adminRole = 'admin';
  static const String managerRole = 'manager';
  static const String waiterRole = 'waiter';
  static const String kitchenRole = 'kitchen';
  
  // Order statuses
  static const String orderPending = 'pending';
  static const String orderApproved = 'approved';
  static const String orderReady = 'ready';
  static const String orderServed = 'served';
  static const String orderCancelled = 'cancelled';
  
  // Table statuses
  static const String tableAvailable = 'available';
  static const String tableOccupied = 'occupied';
}