class OrderItemModel {
  final String menuItemId;
  final int quantity;
  final double price;

  const OrderItemModel({
    required this.menuItemId,
    required this.quantity,
    required this.price,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      menuItemId: json['menuItemId'] ?? '',
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'menuItemId': menuItemId,
      'quantity': quantity,
      'price': price,
    };
  }

  double get totalPrice => price * quantity;
}

class OrderModel {
  final String id;
  final int? tableNumber; // Optional for pickup orders
  final String orderType; // 'dine-in' or 'pickup'
  final List<OrderItemModel> items;
  final String status; // 'pending', 'approved', 'prepared', 'served', 'cancelled', 'billed'
  final String waiterId;
  final String timestamp;
  final String? cancellationReason;

  const OrderModel({
    required this.id,
    this.tableNumber,
    required this.orderType,
    required this.items,
    required this.status,
    required this.waiterId,
    required this.timestamp,
    this.cancellationReason,
  });

  double get totalAmount => items.fold(0, (sum, item) => sum + item.totalPrice);

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['_id'] ?? json['id'] ?? '',
      tableNumber: json['tableNumber'],
      orderType: json['orderType'] ?? 'dine-in',
      items: (json['items'] as List<dynamic>?)
          ?.map((item) => OrderItemModel.fromJson(item))
          .toList() ?? [],
      status: json['status'] ?? 'pending',
      waiterId: json['waiterId'] ?? '',
      timestamp: json['timestamp'] ?? DateTime.now().toIso8601String(),
      cancellationReason: json['cancellationReason'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tableNumber': tableNumber,
      'orderType': orderType,
      'items': items.map((item) => item.toJson()).toList(),
      'status': status,
      'waiterId': waiterId,
      'timestamp': timestamp,
      'cancellationReason': cancellationReason,
    };
  }

  OrderModel copyWith({
    String? id,
    int? tableNumber,
    String? orderType,
    List<OrderItemModel>? items,
    String? status,
    String? waiterId,
    String? timestamp,
    String? cancellationReason,
  }) {
    return OrderModel(
      id: id ?? this.id,
      tableNumber: tableNumber ?? this.tableNumber,
      orderType: orderType ?? this.orderType,
      items: items ?? this.items,
      status: status ?? this.status,
      waiterId: waiterId ?? this.waiterId,
      timestamp: timestamp ?? this.timestamp,
      cancellationReason: cancellationReason ?? this.cancellationReason,
    );
  }
}
