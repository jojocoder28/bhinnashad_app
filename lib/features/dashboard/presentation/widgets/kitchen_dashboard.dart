import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';

class KitchenDashboard extends ConsumerWidget {
  const KitchenDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Kitchen Queue',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              Chip(
                label: const Text('5 Orders'),
                backgroundColor: Colors.orange[100],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: 5, // Mock approved orders
              itemBuilder: (context, index) {
                final isReady = index >= 3; // Mock: first 2 are ready
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  color: isReady ? Colors.green[50] : Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Order #${1000 + index}',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            Chip(
                              label: Text(isReady ? 'Ready' : 'Preparing'),
                              backgroundColor: isReady 
                                  ? Colors.green[100] 
                                  : Colors.orange[100],
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Table ${index + 1} • Ordered: ${10 + index} mins ago'),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Order Items:',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              _OrderItem('Chicken Curry', 2, '15 mins'),
                              _OrderItem('Rice', 2, '5 mins'),
                              _OrderItem('Naan', 4, '8 mins'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        if (!isReady)
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                // Mark as ready
                              },
                              icon: const Icon(Icons.check),
                              label: const Text('Mark as Ready'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                              ),
                            ),
                          )
                        else
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.green[100],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.check_circle, color: Colors.green[700]),
                                const SizedBox(width: 8),
                                Text(
                                  'Ready for Serving',
                                  style: TextStyle(
                                    color: Colors.green[700],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
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

class _OrderItem extends StatelessWidget {
  final String name;
  final int quantity;
  final String prepTime;

  const _OrderItem(this.name, this.quantity, this.prepTime);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('$name x $quantity'),
          Text(
            prepTime,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}