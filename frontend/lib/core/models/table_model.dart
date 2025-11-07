class TableModel {
  final String id;
  final int tableNumber;
  final String status; // 'available' or 'occupied'
  final String? waiterId;

  const TableModel({
    required this.id,
    required this.tableNumber,
    required this.status,
    this.waiterId,
  });

  bool get isAvailable => status == 'available';
  bool get isOccupied => status == 'occupied';

  factory TableModel.fromJson(Map<String, dynamic> json) {
    return TableModel(
      id: json['_id'] ?? json['id'] ?? '',
      tableNumber: json['tableNumber'] ?? 0,
      status: json['status'] ?? 'available',
      waiterId: json['waiterId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tableNumber': tableNumber,
      'status': status,
      'waiterId': waiterId,
    };
  }

  TableModel copyWith({
    String? id,
    int? tableNumber,
    String? status,
    String? waiterId,
  }) {
    return TableModel(
      id: id ?? this.id,
      tableNumber: tableNumber ?? this.tableNumber,
      status: status ?? this.status,
      waiterId: waiterId ?? this.waiterId,
    );
  }
}
