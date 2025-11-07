class MenuItemIngredient {
  final String stockItemId;
  final double quantity;

  const MenuItemIngredient({
    required this.stockItemId,
    required this.quantity,
  });

  factory MenuItemIngredient.fromJson(Map<String, dynamic> json) {
    return MenuItemIngredient(
      stockItemId: json['stockItemId'] ?? '',
      quantity: (json['quantity'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stockItemId': stockItemId,
      'quantity': quantity,
    };
  }
}

class MenuItemModel {
  final String id;
  final String name;
  final double price;
  final String category;
  final String imageUrl;
  final bool isAvailable;
  final List<MenuItemIngredient> ingredients;
  final double costOfGoods;

  const MenuItemModel({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.imageUrl,
    required this.isAvailable,
    required this.ingredients,
    required this.costOfGoods,
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) {
    return MenuItemModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      category: json['category'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      isAvailable: json['isAvailable'] ?? true,
      ingredients: (json['ingredients'] as List<dynamic>?)
          ?.map((item) => MenuItemIngredient.fromJson(item))
          .toList() ?? [],
      costOfGoods: (json['costOfGoods'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'price': price,
      'category': category,
      'imageUrl': imageUrl,
      'isAvailable': isAvailable,
      'ingredients': ingredients.map((i) => i.toJson()).toList(),
      'costOfGoods': costOfGoods,
    };
  }

  MenuItemModel copyWith({
    String? id,
    String? name,
    double? price,
    String? category,
    String? imageUrl,
    bool? isAvailable,
    List<MenuItemIngredient>? ingredients,
    double? costOfGoods,
  }) {
    return MenuItemModel(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      category: category ?? this.category,
      imageUrl: imageUrl ?? this.imageUrl,
      isAvailable: isAvailable ?? this.isAvailable,
      ingredients: ingredients ?? this.ingredients,
      costOfGoods: costOfGoods ?? this.costOfGoods,
    );
  }
}
