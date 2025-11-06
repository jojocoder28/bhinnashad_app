import '../config/app_config.dart';

class PaymentService {
  static final PaymentService _instance = PaymentService._internal();
  factory PaymentService() => _instance;
  PaymentService._internal();

  /// Generate UPI payment URL for QR code
  String generateUpiPaymentUrl({
    required double amount,
    required String orderId,
    String? merchantName,
  }) {
    final upiId = AppConfig.fallbackUpiId;
    final name = merchantName ?? 'Bhinna Shad Restaurant';
    
    // UPI URL format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=TRANSACTION_NOTE
    final upiUrl = 'upi://pay?'
        'pa=$upiId&'
        'pn=${Uri.encodeComponent(name)}&'
        'am=${amount.toStringAsFixed(2)}&'
        'cu=INR&'
        'tn=${Uri.encodeComponent('Order $orderId - $name')}';
    
    return upiUrl;
  }

  /// Generate payment link for web browsers (fallback)
  String generatePaymentLink({
    required double amount,
    required String orderId,
    String? merchantName,
  }) {
    final upiId = AppConfig.fallbackUpiId;
    final name = merchantName ?? 'Bhinna Shad Restaurant';
    
    // Google Pay link format
    final paymentUrl = 'https://pay.google.com/gp/p/ui/pay?'
        'pa=$upiId&'
        'pn=${Uri.encodeComponent(name)}&'
        'am=${amount.toStringAsFixed(2)}&'
        'cu=INR&'
        'tn=${Uri.encodeComponent('Order $orderId')}';
    
    return paymentUrl;
  }

  /// Validate UPI ID format
  bool isValidUpiId(String upiId) {
    final upiRegex = RegExp(r'^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$');
    return upiRegex.hasMatch(upiId);
  }

  /// Format amount for display
  String formatAmount(double amount) {
    return '₹${amount.toStringAsFixed(2)}';
  }
}