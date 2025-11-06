import 'menu_item_model.dart';
import 'user_model.dart';

class OrderItemModel {
  final String menuItemId;
  final MenuItemModel menuItem;
  final int quantity;
  final double price;
  final String? notes;

  const OrderItemModel({
    required this.menuItemId,
    required this.menuItem,
    required this.quantity,
    required this.price,
    this.notes,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      menuItemId: json['menuItemId'] ?? '',
      menuItem: MenuItemModel.fromJson(json['menuItem'] ?? {}),
      quantity: json['quantity'] ?? 1,
      price: (json['price'] ?? 0).toDouble(),
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'menuItemId': menuItemId,
      'menuItem': menuItem.toJson(),
      'quantity': quantity,
      'price': price,
      'notes': notes,
    };
  }

  double get totalPrice => price * quantity;
}

class OrderModel {
  final String id;
  final int tableNumber;
  final String waiterId;
  final UserModel waiter;
  final List<OrderItemModel> items;
  final String status;
  final double totalAmount;
  final String? notes;
  final String? managerId;
  final UserModel? manager;
  final DateTime? approvedAt;
  final DateTime? readyAt;
  final DateTime? servedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const OrderModel({
    required this.id,
    required this.tableNumber,
    required this.waiterId,
    required this.waiter,
    required this.items,
    required this.status,
    required this.totalAmount,
    this.notes,
    this.managerId,
    this.manager,
    this.approvedAt,
    this.readyAt,
    this.servedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['_id'] ?? json['id'] ?? '',
      tableNumber: json['tableNumber'] ?? 0,
      waiterId: json['waiterId'] ?? '',
      waiter: UserModel.fromJson(json['waiter'] ?? {}),
      items: (json['items'] as List<dynamic>?)
          ?.map((item) => OrderItemModel.fromJson(item))
          .toList() ?? [],
      status: json['status'] ?? 'pending',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      notes: json['notes'],
      managerId: json['managerId'],
      manager: json['manager'] != null ? UserModel.fromJson(json['manager']) : null,
      approvedAt: json['approvedAt'] != null ? DateTime.parse(json['approvedAt']) : null,
      readyAt: json['readyAt'] != null ? DateTime.parse(json['readyAt']) : null,
      servedAt: json['servedAt'] != null ? DateTime.parse(json['servedAt']) : null,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tableNumber': tableNumber,
      'waiterId': waiterId,
      'waiter': waiter.toJson(),
      'items': items.map((item) => item.toJson()).toList(),
      'status': status,
      'totalAmount': totalAmount,
      'notes': notes,
      'managerId': managerId,
      'manager': manager?.toJson(),
      'approvedAt': approvedAt?.toIso8601String(),
      'readyAt': readyAt?.toIso8601String(),
      'servedAt': servedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  OrderModel copyWith({
    String? id,
    int? tableNumber,
    String? waiterId,
    UserModel? waiter,
    List<OrderItemModel>? items,
    String? status,
    double? totalAmount,
    String? notes,
    String? managerId,
    UserModel? manager,
    DateTime? approvedAt,
    DateTime? readyAt,
    DateTime? servedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return OrderModel(
      id: id ?? this.id,
      tableNumber: tableNumber ?? this.tableNumber,
      waiterId: waiterId ?? this.waiterId,
      waiter: waiter ?? this.waiter,
      items: items ?? this.items,
      status: status ?? this.status,
      totalAmount: totalAmount ?? this.totalAmount,
      notes: notes ?? this.notes,
      managerId: managerId ?? this.managerId,
      manager: manager ?? this.manager,
      approvedAt: approvedAt ?? this.approvedAt,
      readyAt: readyAt ?? this.readyAt,
      servedAt: servedAt ?? this.servedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}