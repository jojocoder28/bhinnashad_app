import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../../core/services/payment_service.dart';
import '../../../../core/theme/app_theme.dart';

class QRPaymentWidget extends StatelessWidget {
  final double amount;
  final String orderId;
  final String? merchantName;
  final VoidCallback? onPaymentComplete;

  const QRPaymentWidget({
    super.key,
    required this.amount,
    required this.orderId,
    this.merchantName,
    this.onPaymentComplete,
  });

  @override
  Widget build(BuildContext context) {
    final paymentService = PaymentService();
    final upiUrl = paymentService.generateUpiPaymentUrl(
      amount: amount,
      orderId: orderId,
      merchantName: merchantName,
    );

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Scan to Pay',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppTheme.primaryTeal,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            
            // QR Code
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: QrImageView(
                data: upiUrl,
                version: QrVersions.auto,
                size: 200.0,
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Amount display
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.accentGold.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                paymentService.formatAmount(amount),
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: AppTheme.primaryTeal,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            
            const SizedBox(height: 8),
            Text(
              'Order #$orderId',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Instructions
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Text(
                    'How to pay:',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text('1. Open any UPI app (GPay, PhonePe, Paytm, etc.)'),
                  const Text('2. Scan the QR code above'),
                  const Text('3. Verify the amount and complete payment'),
                ],
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: upiUrl));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Payment link copied to clipboard'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
                    icon: const Icon(Icons.copy),
                    label: const Text('Copy Link'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onPaymentComplete,
                    icon: const Icon(Icons.check),
                    label: const Text('Payment Done'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}