class StockItemModel {
  final String id;
  final String name;
  final String unit; // 'kg', 'g', 'l', 'ml', 'piece'
  final double quantityInStock;
  final double lowStockThreshold;
  final double averageCostPerUnit;

  const StockItemModel({
    required this.id,
    required this.name,
    required this.unit,
    required this.quantityInStock,
    required this.lowStockThreshold,
    required this.averageCostPerUnit,
  });

  bool get isLowStock => quantityInStock <= lowStockThreshold;

  factory StockItemModel.fromJson(Map<String, dynamic> json) {
    return StockItemModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      unit: json['unit'] ?? 'piece',
      quantityInStock: (json['quantityInStock'] ?? 0).toDouble(),
      lowStockThreshold: (json['lowStockThreshold'] ?? 0).toDouble(),
      averageCostPerUnit: (json['averageCostPerUnit'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'unit': unit,
      'quantityInStock': quantityInStock,
      'lowStockThreshold': lowStockThreshold,
      'averageCostPerUnit': averageCostPerUnit,
    };
  }
}
