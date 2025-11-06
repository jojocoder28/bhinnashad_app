import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../payment/presentation/widgets/qr_payment_widget.dart';

class WaiterDashboard extends ConsumerStatefulWidget {
  const WaiterDashboard({super.key});

  @override
  ConsumerState<WaiterDashboard> createState() => _WaiterDashboardState();
}

class _WaiterDashboardState extends ConsumerState<WaiterDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _selectedIndex,
        children: const [
          _TablesView(),
          _OrdersView(),
          _MenuView(),
          _BillingView(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        selectedItemColor: AppTheme.primaryTeal,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.table_restaurant),
            label: 'Tables',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Orders',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu_book),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.payment),
            label: 'Billing',
          ),
        ],
      ),
    );
  }
}

class _TablesView extends StatelessWidget {
  const _TablesView();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Table Status',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.2,
              ),
              itemCount: 12, // Example: 12 tables
              itemBuilder: (context, index) {
                final tableNumber = index + 1;
                final isOccupied = index % 3 == 0; // Mock data
                
                return Card(
                  color: isOccupied ? Colors.red[100] : Colors.green[100],
                  child: InkWell(
                    onTap: () {
                      // Navigate to order creation for this table
                    },
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.table_restaurant,
                          size: 32,
                          color: isOccupied ? Colors.red[700] : Colors.green[700],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Table $tableNumber',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          isOccupied ? 'Occupied' : 'Available',
                          style: TextStyle(
                            color: isOccupied ? Colors.red[700] : Colors.green[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _OrdersView extends StatelessWidget {
  const _OrdersView();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'My Orders',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              ElevatedButton.icon(
                onPressed: () {
                  // Navigate to create new order
                },
                icon: const Icon(Icons.add),
                label: const Text('New Order'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: 5, // Mock data
              itemBuilder: (context, index) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.primaryTeal,
                      child: Text('${index + 1}'),
                    ),
                    title: Text('Table ${index + 1}'),
                    subtitle: Text('Order #${1000 + index} - ₹${(index + 1) * 250}'),
                    trailing: Chip(
                      label: Text(
                        index % 3 == 0 ? 'Pending' : 
                        index % 3 == 1 ? 'Approved' : 'Ready',
                      ),
                      backgroundColor: index % 3 == 0 ? Colors.orange[100] :
                                     index % 3 == 1 ? Colors.blue[100] : Colors.green[100],
                    ),
                    onTap: () {
                      // View order details
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuView extends StatelessWidget {
  const _MenuView();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Menu Items',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: 10, // Mock data
              itemBuilder: (context, index) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.fastfood),
                    ),
                    title: Text('Menu Item ${index + 1}'),
                    subtitle: Text('₹${(index + 1) * 50}'),
                    trailing: IconButton(
                      icon: const Icon(Icons.add_shopping_cart),
                      onPressed: () {
                        // Add to cart
                      },
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _BillingView extends StatelessWidget {
  const _BillingView();

  void _showQRPaymentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: QRPaymentWidget(
          amount: 520.0,
          orderId: '1005',
          merchantName: 'Bhinna Shad Restaurant',
          onPaymentComplete: () {
            Navigator.of(context).pop();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Payment confirmed! Order marked as paid.'),
                backgroundColor: Colors.green,
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Generate Bill',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Table 5 - Order #1005',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  _BillItem('Chicken Curry', 2, 150),
                  _BillItem('Rice', 2, 50),
                  _BillItem('Naan', 4, 30),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total:',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Text(
                        '₹520',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryTeal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        _showQRPaymentDialog(context);
                      },
                      icon: const Icon(Icons.qr_code),
                      label: const Text('Generate QR Code'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BillItem extends StatelessWidget {
  final String name;
  final int quantity;
  final double price;

  const _BillItem(this.name, this.quantity, this.price);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text('$name x $quantity'),
          ),
          Text('₹${(price * quantity).toStringAsFixed(0)}'),
        ],
      ),
    );
  }
}