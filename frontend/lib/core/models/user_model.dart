class UserModel {
  final String id;
  final String email;
  final String name;
  final String role; // 'admin', 'manager', 'waiter', 'user'
  final String status; // 'pending', 'approved'

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.status,
  });

  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'user',
      status: json['status'] ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'status': status,
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? role,
    String? status,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      status: status ?? this.status,
    );
  }
}
