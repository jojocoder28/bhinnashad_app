import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  // API Configuration
  static String get baseUrl => 
      dotenv.env['API_BASE_URL'] ?? 
      const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://10.0.2.2:9002/api');
  
  // Cloudinary Configuration
  static String get cloudinaryCloudName => 
      dotenv.env['CLOUDINARY_CLOUD_NAME'] ?? 
      const String.fromEnvironment('CLOUDINARY_CLOUD_NAME', defaultValue: 'drw148izx');
  
  static String get cloudinaryApiKey => 
      dotenv.env['CLOUDINARY_API_KEY'] ?? 
      const String.fromEnvironment('CLOUDINARY_API_KEY', defaultValue: '248126434961473');
  
  static String get cloudinaryApiSecret => 
      dotenv.env['CLOUDINARY_API_SECRET'] ?? 
      const String.fromEnvironment('CLOUDINARY_API_SECRET', defaultValue: 'ftP0WnkLkKZ8gqe9h_eQkjZF3QQ');
  
  // Payment Configuration
  static String get fallbackUpiId => 
      dotenv.env['FALLBACK_UPI_ID'] ?? 
      const String.fromEnvironment('FALLBACK_UPI_ID', defaultValue: 'dasjojo7-1@okicici');
  
  // Environment
  static String get environment => 
      dotenv.env['ENVIRONMENT'] ?? 
      const String.fromEnvironment('ENVIRONMENT', defaultValue: 'development');
  
  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
  
  // Cloudinary upload URL
  static String get cloudinaryUploadUrl => 
      'https://api.cloudinary.com/v1_1/$cloudinaryCloudName/image/upload';
}