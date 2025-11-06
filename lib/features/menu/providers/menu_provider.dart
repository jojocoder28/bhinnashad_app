import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/models/menu_item_model.dart';
import '../../../core/services/api_service.dart';
import '../../../features/auth/providers/auth_provider.dart';

class MenuState {
  final List<MenuItemModel> menuItems;
  final bool isLoading;
  final String? error;

  const MenuState({
    this.menuItems = const [],
    this.isLoading = false,
    this.error,
  });

  MenuState copyWith({
    List<MenuItemModel>? menuItems,
    bool? isLoading,
    String? error,
  }) {
    return MenuState(
      menuItems: menuItems ?? this.menuItems,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class MenuNotifier extends StateNotifier<MenuState> {
  final ApiService _apiService;

  MenuNotifier(this._apiService) : super(const MenuState());

  Future<void> loadMenuItems() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final menuItems = await _apiService.getMenuItems();

      state = state.copyWith(
        menuItems: menuItems,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> createMenuItem(Map<String, dynamic> menuItemData) async {
    try {
      final newMenuItem = await _apiService.createMenuItem(menuItemData);
      
      state = state.copyWith(
        menuItems: [...state.menuItems, newMenuItem],
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> updateMenuItem(String id, Map<String, dynamic> menuItemData) async {
    try {
      final updatedMenuItem = await _apiService.updateMenuItem(id, menuItemData);

      final updatedMenuItems = state.menuItems.map((item) {
        return item.id == id ? updatedMenuItem : item;
      }).toList();

      state = state.copyWith(menuItems: updatedMenuItems);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> deleteMenuItem(String id) async {
    try {
      await _apiService.deleteMenuItem(id);

      final updatedMenuItems = state.menuItems
          .where((item) => item.id != id)
          .toList();

      state = state.copyWith(menuItems: updatedMenuItems);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  // Get menu items by category
  List<MenuItemModel> getMenuItemsByCategory(String category) {
    return state.menuItems
        .where((item) => item.category.toLowerCase() == category.toLowerCase())
        .toList();
  }

  // Get available menu items only
  List<MenuItemModel> getAvailableMenuItems() {
    return state.menuItems.where((item) => item.isAvailable).toList();
  }

  // Search menu items
  List<MenuItemModel> searchMenuItems(String query) {
    final lowercaseQuery = query.toLowerCase();
    return state.menuItems.where((item) {
      return item.name.toLowerCase().contains(lowercaseQuery) ||
             item.description.toLowerCase().contains(lowercaseQuery) ||
             item.category.toLowerCase().contains(lowercaseQuery);
    }).toList();
  }
}

final menuProvider = StateNotifierProvider<MenuNotifier, MenuState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return MenuNotifier(apiService);
});

// Provider for available menu items only
final availableMenuItemsProvider = Provider<List<MenuItemModel>>((ref) {
  final menuState = ref.watch(menuProvider);
  return menuState.menuItems.where((item) => item.isAvailable).toList();
});

// Provider for menu categories
final menuCategoriesProvider = Provider<List<String>>((ref) {
  final menuState = ref.watch(menuProvider);
  final categories = menuState.menuItems
      .map((item) => item.category)
      .toSet()
      .toList();
  categories.sort();
  return categories;
});