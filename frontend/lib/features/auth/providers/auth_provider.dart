import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

import '../../../core/models/user_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/config/app_config.dart';

class AuthState {
  final bool isAuthenticated;
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    UserModel? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;
  final StorageService _storageService;

  AuthNotifier(this._apiService, this._storageService)
      : super(const AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final token = _storageService.authToken;
    final userData = _storageService.userData;

    if (token != null && userData != null) {
      // Check if token is still valid
      if (!JwtDecoder.isExpired(token)) {
        state = state.copyWith(
          isAuthenticated: true,
          user: userData,
        );
      } else {
        // Token expired, clear storage
        await logout();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _apiService.login(email, password);

      final token = response['token'] as String;
      final userJson = response['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);

      // Check if user is approved
      if (!user.isApproved) {
        state = state.copyWith(
          isLoading: false,
          error:
              'Your account is pending approval. Please contact an administrator.',
        );
        return false;
      }

      await _storageService.setAuthToken(token);
      await _storageService.setUserData(user);

      state = state.copyWith(
        isAuthenticated: true,
        user: user,
        isLoading: false,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getErrorMessage(e),
      );
      return false;
    }
  }

  Future<bool> signup(
      String name, String email, String password, String role) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _apiService.signup({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      });

      state = state.copyWith(
        isLoading: false,
        error: null,
      );

      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getErrorMessage(e),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _storageService.clearAuthToken();
    await _storageService.clearUserData();

    state = const AuthState();
  }

  String _getErrorMessage(dynamic error) {
    if (error is DioException) {
      if (error.response?.data is Map<String, dynamic>) {
        return error.response?.data['message'] ?? 'An error occurred';
      }
      return error.message ?? 'Network error';
    }
    return error.toString();
  }
}

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio();
  final storageService = StorageService();

  // Add auth interceptor
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = storageService.authToken;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ),
  );

  return dio;
});

final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return ApiService(dio, baseUrl: AppConfig.baseUrl);
});

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return AuthNotifier(apiService, storageService);
});
