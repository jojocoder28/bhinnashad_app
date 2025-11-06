import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/order_model.dart';
import '../../../core/services/api_service.dart';
import '../../../features/auth/providers/auth_provider.dart';

class OrdersState {
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;

  const OrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
  });

  OrdersState copyWith({
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class OrdersNotifier extends StateNotifier<OrdersState> {
  final ApiService _apiService;
  final Ref _ref;

  OrdersNotifier(this._apiService, this._ref) : super(const OrdersState());

  Future<void> loadOrders({
    String? status,
    String? waiterId,
    int? tableNumber,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final orders = await _apiService.getOrders(
        status: status,
        waiterId: waiterId,
        tableNumber: tableNumber,
      );

      state = state.copyWith(
        orders: orders,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createOrder(Map<String, dynamic> orderData) async {
    try {
      final newOrder = await _apiService.createOrder(orderData);
      
      state = state.copyWith(
        orders: [...state.orders, newOrder],
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final updatedOrder = await _apiService.updateOrder(
        orderId,
        {'status': status},
      );

      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> approveOrder(String orderId) async {
    try {
      final updatedOrder = await _apiService.approveOrder(orderId);

      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> markOrderReady(String orderId) async {
    try {
      final updatedOrder = await _apiService.markOrderReady(orderId);

      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> markOrderServed(String orderId) async {
    try {
      final updatedOrder = await _apiService.markOrderServed(orderId);

      final updatedOrders = state.orders.map((order) {
        return order.id == orderId ? updatedOrder : order;
      }).toList();

      state = state.copyWith(orders: updatedOrders);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> cancelOrder(String orderId) async {
    try {
      await _apiService.cancelOrder(orderId);

      final updatedOrders = state.orders
          .where((order) => order.id != orderId)
          .toList();

      state = state.copyWith(orders: updatedOrders);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Get orders by status
  List<OrderModel> getOrdersByStatus(String status) {
    return state.orders.where((order) => order.status == status).toList();
  }

  // Get orders for current waiter
  List<OrderModel> getMyOrders() {
    final user = _ref.read(authProvider).user;
    if (user == null) return [];
    
    return state.orders.where((order) => order.waiterId == user.id).toList();
  }
}

final ordersProvider = StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return OrdersNotifier(apiService, ref);
});

// Specific providers for different order states
final pendingOrdersProvider = Provider<List<OrderModel>>((ref) {
  final ordersState = ref.watch(ordersProvider);
  return ordersState.orders.where((order) => order.status == 'pending').toList();
});

final approvedOrdersProvider = Provider<List<OrderModel>>((ref) {
  final ordersState = ref.watch(ordersProvider);
  return ordersState.orders.where((order) => order.status == 'approved').toList();
});

final readyOrdersProvider = Provider<List<OrderModel>>((ref) {
  final ordersState = ref.watch(ordersProvider);
  return ordersState.orders.where((order) => order.status == 'ready').toList();
});

final myOrdersProvider = Provider<List<OrderModel>>((ref) {
  final ordersNotifier = ref.watch(ordersProvider.notifier);
  return ordersNotifier.getMyOrders();
});