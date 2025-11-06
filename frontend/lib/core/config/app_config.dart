import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  // API Configuration
  static String get baseUrl => dotenv.env['API_BASE_URL']!;
  
  // Cloudinary Configuration
  static String get cloudinaryCloudName => dotenv.env['CLOUDINARY_CLOUD_NAME']!;
  
  static String get cloudinaryApiKey => dotenv.env['CLOUDINARY_API_KEY']!;
  
  static String get cloudinaryApiSecret => dotenv.env['CLOUDINARY_API_SECRET']!;
  
  // Payment Configuration
  static String get fallbackUpiId => dotenv.env['FALLBACK_UPI_ID']!;
  
  // Environment
  static String get environment => dotenv.env['ENVIRONMENT']!;
  
  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
  
  // Cloudinary upload URL
  static String get cloudinaryUploadUrl => 
      'https://api.cloudinary.com/v1_1/$cloudinaryCloudName/image/upload';
}
