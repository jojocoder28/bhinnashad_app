import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../auth/providers/auth_provider.dart';
import '../widgets/admin_dashboard.dart';
import '../widgets/kitchen_dashboard.dart';
import '../widgets/manager_dashboard.dart';
import '../widgets/waiter_dashboard.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${user.name}'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                ref.read(authProvider.notifier).logout();
                context.go('/login');
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    const Icon(Icons.person),
                    const SizedBox(width: 8),
                    Text('Profile (${user.role.toUpperCase()})'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 8),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: _buildDashboardContent(user.role),
    );
  }

  Widget _buildDashboardContent(String role) {
    switch (role) {
      case AppConstants.adminRole:
        return const AdminDashboard();
      case AppConstants.managerRole:
        return const ManagerDashboard();
      case AppConstants.waiterRole:
        return const WaiterDashboard();
      case AppConstants.kitchenRole:
        return const KitchenDashboard();
      default:
        return const Center(
          child: Text('Unknown role'),
        );
    }
  }
}