import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../models/bill_model.dart';
import '../models/menu_item_model.dart';
import '../models/order_model.dart';
import '../models/stock_item_model.dart';
import '../models/table_model.dart';
import '../models/user_model.dart';

class ApiService {
  final Dio _dio;
  final String baseUrl;

  ApiService(this._dio, {String? baseUrl}) : baseUrl = baseUrl ?? AppConfig.baseUrl {
    _dio.options.baseUrl = this.baseUrl;
  }

  // ==================== AUTH ENDPOINTS ====================
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
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

  // ==================== USER ENDPOINTS ====================
  
  Future<List<UserModel>> getUsers() async {
    final response = await _dio.get('/users');
    return (response.data as List)
        .map((user) => UserModel.fromJson(user))
        .toList();
  }

  Future<UserModel> getUserById(String id) async {
    final response = await _dio.get('/users/$id');
    return UserModel.fromJson(response.data);
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

  Future<UserModel> approveUser(String id) async {
    final response = await _dio.patch('/users/$id/approve');
    return UserModel.fromJson(response.data);
  }

  // ==================== MENU ENDPOINTS ====================
  
  Future<List<MenuItemModel>> getMenuItems({
    String? category,
    bool? isAvailable,
  }) async {
    final queryParams = <String, dynamic>{};
    if (category != null) queryParams['category'] = category;
    if (isAvailable != null) queryParams['isAvailable'] = isAvailable;

    final response = await _dio.get('/menu', queryParameters: queryParams);
    return (response.data as List)
        .map((item) => MenuItemModel.fromJson(item))
        .toList();
  }

  Future<MenuItemModel> getMenuItemById(String id) async {
    final response = await _dio.get('/menu/$id');
    return MenuItemModel.fromJson(response.data);
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

  // ==================== ORDER ENDPOINTS ====================
  
  Future<List<OrderModel>> getOrders({
    String? status,
    String? waiterId,
    int? tableNumber,
    String? orderType,
  }) async {
    final queryParams = <String, dynamic>{};
    if (status != null) queryParams['status'] = status;
    if (waiterId != null) queryParams['waiterId'] = waiterId;
    if (tableNumber != null) queryParams['tableNumber'] = tableNumber;
    if (orderType != null) queryParams['orderType'] = orderType;

    final response = await _dio.get('/orders', queryParameters: queryParams);
    return (response.data as List)
        .map((order) => OrderModel.fromJson(order))
        .toList();
  }

  Future<OrderModel> getOrderById(String id) async {
    final response = await _dio.get('/orders/$id');
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> createOrder(Map<String, dynamic> body) async {
    final response = await _dio.post('/orders', data: body);
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> updateOrderStatus(String id, String status) async {
    final response = await _dio.patch('/orders/$id/status', data: {
      'status': status,
    });
    return OrderModel.fromJson(response.data);
  }

  Future<OrderModel> cancelOrder(String id, String reason) async {
    final response = await _dio.post('/orders/$id/cancel', data: {
      'reason': reason,
    });
    return OrderModel.fromJson(response.data);
  }

  // ==================== TABLE ENDPOINTS ====================
  
  Future<List<TableModel>> getTables() async {
    final response = await _dio.get('/tables');
    return (response.data as List)
        .map((table) => TableModel.fromJson(table))
        .toList();
  }

  Future<TableModel> getTableById(String id) async {
    final response = await _dio.get('/tables/$id');
    return TableModel.fromJson(response.data);
  }

  Future<TableModel> createTable(int tableNumber) async {
    final response = await _dio.post('/tables', data: {
      'tableNumber': tableNumber,
    });
    return TableModel.fromJson(response.data);
  }

  Future<TableModel> updateTableStatus(String id, String status, {String? waiterId}) async {
    final response = await _dio.patch('/tables/$id/status', data: {
      'status': status,
      'waiterId': waiterId,
    });
    return TableModel.fromJson(response.data);
  }

  Future<void> deleteTable(String id) async {
    await _dio.delete('/tables/$id');
  }

  // ==================== BILL ENDPOINTS ====================
  
  Future<List<BillModel>> getBills({
    String? status,
    int? tableNumber,
  }) async {
    final queryParams = <String, dynamic>{};
    if (status != null) queryParams['status'] = status;
    if (tableNumber != null) queryParams['tableNumber'] = tableNumber;

    final response = await _dio.get('/bills', queryParameters: queryParams);
    return (response.data as List)
        .map((bill) => BillModel.fromJson(bill))
        .toList();
  }

  Future<BillModel> getBillById(String id) async {
    final response = await _dio.get('/bills/$id');
    return BillModel.fromJson(response.data);
  }

  Future<BillModel> createBillForTable(int tableNumber) async {
    final response = await _dio.post('/bills/table/$tableNumber');
    return BillModel.fromJson(response.data);
  }

  Future<BillModel> markBillAsPaid(String id) async {
    final response = await _dio.patch('/bills/$id/pay');
    return BillModel.fromJson(response.data);
  }

  // ==================== STOCK ENDPOINTS ====================
  
  Future<List<StockItemModel>> getStockItems() async {
    final response = await _dio.get('/stock/items');
    return (response.data as List)
        .map((item) => StockItemModel.fromJson(item))
        .toList();
  }

  Future<StockItemModel> createStockItem(Map<String, dynamic> body) async {
    final response = await _dio.post('/stock/items', data: body);
    return StockItemModel.fromJson(response.data);
  }

  Future<StockItemModel> updateStockItem(String id, Map<String, dynamic> body) async {
    final response = await _dio.put('/stock/items/$id', data: body);
    return StockItemModel.fromJson(response.data);
  }

  Future<void> deleteStockItem(String id) async {
    await _dio.delete('/stock/items/$id');
  }

  // Suppliers
  Future<List<Map<String, dynamic>>> getSuppliers() async {
    final response = await _dio.get('/stock/suppliers');
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<Map<String, dynamic>> createSupplier(Map<String, dynamic> body) async {
    final response = await _dio.post('/stock/suppliers', data: body);
    return response.data;
  }

  // Purchase Orders
  Future<List<Map<String, dynamic>>> getPurchaseOrders() async {
    final response = await _dio.get('/stock/purchase-orders');
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<Map<String, dynamic>> createPurchaseOrder(Map<String, dynamic> body) async {
    final response = await _dio.post('/stock/purchase-orders', data: body);
    return response.data;
  }

  Future<Map<String, dynamic>> updatePurchaseOrderStatus(String id, String status) async {
    final response = await _dio.patch('/stock/purchase-orders/$id/status', data: {
      'status': status,
    });
    return response.data;
  }

  // Stock Usage Logs
  Future<List<Map<String, dynamic>>> getStockUsageLogs({
    String? stockItemId,
    String? category,
  }) async {
    final queryParams = <String, dynamic>{};
    if (stockItemId != null) queryParams['stockItemId'] = stockItemId;
    if (category != null) queryParams['category'] = category;

    final response = await _dio.get('/stock/usage-logs', queryParameters: queryParams);
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<Map<String, dynamic>> recordStockUsage(Map<String, dynamic> body) async {
    final response = await _dio.post('/stock/usage-logs', data: body);
    return response.data;
  }

  // ==================== WAITER ENDPOINTS ====================
  
  Future<List<Map<String, dynamic>>> getWaiters() async {
    final response = await _dio.get('/waiters');
    return List<Map<String, dynamic>>.from(response.data);
  }

  // ==================== REPORTS ENDPOINTS ====================
  
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

  Future<Map<String, dynamic>> getDashboardSummary() async {
    final response = await _dio.get('/reports/dashboard');
    return response.data;
  }
}
