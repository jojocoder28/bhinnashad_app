import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'core/app.dart';
import 'core/constants/app_constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    // .env file not found, will use default values from AppConfig
    print('Warning: .env file not found, using default configuration');
  }
  
  // Initialize Hive
  await Hive.initFlutter();
  await Hive.openBox(AppConstants.userBox);
  await Hive.openBox(AppConstants.settingsBox);
  
  runApp(
    const ProviderScope(
      child: BhinnaShad(),
    ),
  );
}