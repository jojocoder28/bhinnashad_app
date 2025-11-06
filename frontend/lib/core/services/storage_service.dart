import 'dart:convert';

import 'package:hive/hive.dart';

import '../constants/app_constants.dart';
import '../models/user_model.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  late Box _userBox;
  late Box _settingsBox;

  Future<void> init() async {
    _userBox = await Hive.openBox(AppConstants.userBox);
    _settingsBox = await Hive.openBox(AppConstants.settingsBox);
  }

  // Auth token management
  String? get authToken => _userBox.get(AppConstants.tokenKey);
  
  Future<void> setAuthToken(String token) async {
    await _userBox.put(AppConstants.tokenKey, token);
  }

  Future<void> clearAuthToken() async {
    await _userBox.delete(AppConstants.tokenKey);
  }

  // User data management
  UserModel? get userData {
    final userJson = _userBox.get(AppConstants.userDataKey);
    if (userJson != null) {
      return UserModel.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  Future<void> setUserData(UserModel user) async {
    await _userBox.put(AppConstants.userDataKey, jsonEncode(user.toJson()));
  }

  Future<void> clearUserData() async {
    await _userBox.delete(AppConstants.userDataKey);
  }

  // Settings management
  String? get themeMode => _settingsBox.get(AppConstants.themeKey);
  
  Future<void> setThemeMode(String mode) async {
    await _settingsBox.put(AppConstants.themeKey, mode);
  }

  // Clear all data
  Future<void> clearAll() async {
    await _userBox.clear();
    await _settingsBox.clear();
  }
}