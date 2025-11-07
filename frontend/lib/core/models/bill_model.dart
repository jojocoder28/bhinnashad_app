class BillModel {
  final String id;
  final int? tableNumber;
  final List<String> orderIds;
  final String? waiterId;
  final double subtotal;
  final double tax;
  final double total;
  final String status; // 'unpaid' or 'paid'
  final String timestamp;

  const BillModel({
    required this.id,
    this.tableNumber,
    required this.orderIds,
    this.waiterId,
    required this.subtotal,
    required this.tax,
    required this.total,
    required this.status,
    required this.timestamp,
  });

  bool get isPaid => status == 'paid';
  bool get isUnpaid => status == 'unpaid';

  factory BillModel.fromJson(Map<String, dynamic> json) {
    return BillModel(
      id: json['_id'] ?? json['id'] ?? '',
      tableNumber: json['tableNumber'],
      orderIds: List<String>.from(json['orderIds'] ?? []),
      waiterId: json['waiterId'],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      tax: (json['tax'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      status: json['status'] ?? 'unpaid',
      timestamp: json['timestamp'] ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tableNumber': tableNumber,
      'orderIds': orderIds,
      'waiterId': waiterId,
      'subtotal': subtotal,
      'tax': tax,
      'total': total,
      'status': status,
      'timestamp': timestamp,
    };
  }
}
