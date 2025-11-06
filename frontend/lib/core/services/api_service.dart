import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../models/menu_item_model.dart';
import '../models/order_model.dart';
import '../models/user_model.dart';

class ApiService {
  final Dio _dio;
  final String baseUrl;

  ApiService(this._dio, {String? baseUrl}) : baseUrl = baseUrl ?? AppConfig.baseUrl {
    _dio.options.baseUrl = this.baseUrl;
  }

  // Auth endpoints
  Future<Map<String, dynamic>> login(Map<String, dynamic> body) async {
    final response = await _dio.post('/auth/login', data: body);
    return response.data;
  }

  Future<Map<String, dynamic>> signup(Map<String, dynamic> body) async {
    final response = await _dio.post('/auth/signup', data: body);
    return response.data;
  }

  Future<UserModel> getCurrentUser() async {
    final response = await _dio.get('/auth/me');
    return UserModel.fromJson(response.data);
  }

  // Menu endpoints
  Future<List<MenuItemModel>> getMenuItems() async {
    final response = await _dio.get('/menu');
    return (response.data as List)
        .map((item) => MenuItemModel.fromJson(item))
        .toList();
  }

  Future<MenuItemModel> createMenuItem(Map<String, dynamic> body) async {
    final response = await _dio.post('/menu', data: body);
    return MenuItemModel.fromJson(response.data);
  }

  Future<MenuItemModel> updateMenuItem(String id, Map<String, dynamic> body) async {
    final response = await _dio.put('/menu/$id', data: body);
    return MenuItemModel.fromJson(response.data);
  }

  Future<void> deleteMenuItem(String id) async {
    await _dio.delete('/menu/$id');
  }

  // Order endpoints
  Future<List<OrderModel>> getOrders({
    String? status,
    String? waiterId,
    int? tableNumber,
  }) async {
    final queryParams = <String, dynamic>{};
    if (status != null) queryParams['status'] = status;
    if (waiterId != null) queryParams['waiterId'] = waiterId;
    if (tableNumber != null) queryParams['tableNumber'] = tableNumber;

    final response = await _dio.get('/orders', queryParameters: queryParams);
    return (response.data as List)
        .map((order) => OrderModel.fromJson(order))
        .toList();
  }

  Future<OrderModel> createOrder(Map<String, dynamic> body) async {
    final response = await _dio.post('/orders', data: body);
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> updateOrder(String id, Map<String, dynamic> body) async {
    final response = await _dio.put('/orders/$id', data: body);
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> approveOrder(String id) async {
    final response = await _dio.put('/orders/$id/approve');
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> markOrderReady(String id) async {
    final response = await _dio.put('/orders/$id/ready');
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> markOrderServed(String id) async {
    final response = await _dio.put('/orders/$id/served');
    return OrderModel.fromJson(response.data);
  }

  Future<void> cancelOrder(String id) async {
    await _dio.delete('/orders/$id');
  }

  // User management endpoints
  Future<List<UserModel>> getUsers() async {
    final response = await _dio.get('/users');
    return (response.data as List)
        .map((user) => UserModel.fromJson(user))
        .toList();
  }

  Future<UserModel> createUser(Map<String, dynamic> body) async {
    final response = await _dio.post('/users', data: body);
    return UserModel.fromJson(response.data);
  }

  Future<UserModel> updateUser(String id, Map<String, dynamic> body) async {
    final response = await _dio.put('/users/$id', data: body);
    return UserModel.fromJson(response.data);
  }

  Future<void> deleteUser(String id) async {
    await _dio.delete('/users/$id');
  }

  // Table management
  Future<List<Map<String, dynamic>>> getTables() async {
    final response = await _dio.get('/tables');
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<Map<String, dynamic>> updateTableStatus(
    int number,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.put('/tables/$number', data: body);
    return response.data;
  }

  // Reports
  Future<Map<String, dynamic>> getRevenueReport({
    String? startDate,
    String? endDate,
  }) async {
    final queryParams = <String, dynamic>{};
    if (startDate != null) queryParams['startDate'] = startDate;
    if (endDate != null) queryParams['endDate'] = endDate;

    final response = await _dio.get('/reports/revenue', queryParameters: queryParams);
    return response.data;
  }

  Future<Map<String, dynamic>> getOrdersReport({
    String? startDate,
    String? endDate,
  }) async {
    final queryParams = <String, dynamic>{};
    if (startDate != null) queryParams['startDate'] = startDate;
    if (endDate != null) queryParams['endDate'] = endDate;

    final response = await _dio.get('/reports/orders', queryParameters: queryParams);
    return response.data;
  }
}
