# Schema Alignment Documentation

This document confirms that the Node.js backend uses the **exact same schema** as the existing Next.js backend, ensuring seamless database compatibility.

## Database Configuration

- **Database Name**: `bhinna_shad`
- **Connection**: MongoDB Atlas (same cluster as Next.js backend)
- **No timestamps**: Models use `timestamps: false` to match backend
- **No version keys**: Models use `versionKey: false` to match backend

## Collection Names (Exact Match)

| Model | Collection Name | Status |
|-------|----------------|--------|
| User | `users` | ✅ Matched |
| MenuItem | `menu` | ✅ Matched |
| Order | `orders` | ✅ Matched |
| Table | `tables` | ✅ Matched |
| Waiter | `waiters` | ✅ Matched |
| Bill | `bills` | ✅ Matched |
| StockItem | `stock` | ✅ Matched |
| Supplier | `suppliers` | ✅ Matched |
| PurchaseOrder | `purchase_orders` | ✅ Matched |
| StockUsageLog | `stock_usage_logs` | ✅ Matched |
| OnlineOrder | `online_orders` | ✅ Matched |

## Schema Definitions (Exact Match)

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String,
  role: 'admin' | 'manager' | 'waiter' | 'user',
  status: 'pending' | 'approved'
}
```
**Key Changes**: 
- ✅ `status` instead of `isApproved`
- ✅ Role includes `'user'` instead of `'kitchen'`

### MenuItem Schema
```javascript
{
  name: String,
  price: Number,
  category: String,
  imageUrl: String,
  isAvailable: Boolean,
  ingredients: [{
    stockItemId: String,
    quantity: Number
  }],
  costOfGoods: Number
}
```
**Key Changes**:
- ✅ Removed `description`, `preparationTime`, `spiceLevel`, `isVegetarian`
- ✅ `ingredients` is array of objects with `{stockItemId, quantity}`
- ✅ Added `costOfGoods` field

### Order Schema
```javascript
{
  tableNumber: Number (optional),
  orderType: 'dine-in' | 'pickup',
  items: [{
    menuItemId: String,
    quantity: Number,
    price: Number
  }],
  status: 'pending' | 'approved' | 'prepared' | 'served' | 'cancelled' | 'billed',
  waiterId: String,
  timestamp: String (ISO format),
  cancellationReason: String (optional)
}
```
**Key Changes**:
- ✅ Added `orderType` field
- ✅ `timestamp` as String instead of Date
- ✅ Status includes `'prepared'` and `'billed'`
- ✅ Removed nested objects, using IDs only
- ✅ `waiterId` is String, not ObjectId

### Table Schema
```javascript
{
  tableNumber: Number (unique),
  status: 'available' | 'occupied',
  waiterId: String | null
}
```
**Key Changes**:
- ✅ `tableNumber` instead of `number`
- ✅ Removed `capacity`, `currentWaiterId`, `currentOrderId`
- ✅ Only two statuses: `'available'` and `'occupied'`

### StockItem Schema
```javascript
{
  name: String,
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece',
  quantityInStock: Number,
  lowStockThreshold: Number,
  averageCostPerUnit: Number
}
```
**Key Changes**:
- ✅ `quantityInStock` instead of `currentStock`
- ✅ `lowStockThreshold` instead of `minimumStock`
- ✅ `averageCostPerUnit` instead of `cost`
- ✅ Removed `category`, `supplierId`

### Supplier Schema
```javascript
{
  name: String,
  contactPerson: String (optional),
  phone: String,
  email: String (optional)
}
```
**Key Changes**:
- ✅ Removed `address` field
- ✅ Made `contactPerson` and `email` optional

### PurchaseOrder Schema
```javascript
{
  supplierId: String,
  items: [{
    stockItemId: String,
    quantity: Number,
    costPerUnit: Number
  }],
  totalCost: Number,
  date: String (ISO format),
  status: 'ordered' | 'received' | 'cancelled'
}
```
**Key Changes**:
- ✅ `totalCost` instead of `totalAmount`
- ✅ `date` instead of `orderDate`
- ✅ Status values: `'ordered'`, `'received'`, `'cancelled'`

### StockUsageLog Schema
```javascript
{
  stockItemId: String,
  quantityUsed: Number,
  category: 'kitchen_prep' | 'spillage' | 'staff_meal' | 'other',
  notes: String (optional),
  recordedBy: String,
  timestamp: String (ISO format)
}
```
**Key Changes**:
- ✅ `quantityUsed` instead of `quantity`
- ✅ `category` instead of `usageType`
- ✅ Added `recordedBy` field

### Bill Schema
```javascript
{
  tableNumber: Number (optional),
  orderIds: [String],
  waiterId: String (optional),
  subtotal: Number,
  tax: Number,
  total: Number,
  status: 'unpaid' | 'paid',
  timestamp: String (ISO format)
}
```

### Waiter Schema
```javascript
{
  name: String,
  userId: String
}
```

### OnlineOrder Schema
```javascript
{
  userId: String,
  items: [{
    menuItemId: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: 'payment_pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled',
  timestamp: String (ISO format),
  paymentId: String
}
```

## API Endpoints

All endpoints match the backend structure:

- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/users` - Get all users
- `PATCH /api/users/:id/approve` - Approve user (changes status to 'approved')
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Create menu item
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/tables` - Get tables
- `GET /api/waiters` - Get waiters
- `GET /api/bills` - Get bills
- `POST /api/bills/table/:tableNumber` - Create bill for table
- `PATCH /api/bills/:id/pay` - Mark bill as paid
- `GET /api/stock/items` - Get stock items
- `GET /api/stock/suppliers` - Get suppliers
- `GET /api/stock/purchase-orders` - Get purchase orders
- `GET /api/stock/usage-logs` - Get stock usage logs

## Data Type Consistency

- **IDs**: All foreign keys stored as `String` (not ObjectId references)
- **Timestamps**: All timestamps stored as ISO `String` format
- **No Mongoose timestamps**: `timestamps: false` in all schemas
- **No version keys**: `versionKey: false` in all schemas
- **Embedded objects**: Minimal, only where necessary (e.g., order items)

## Testing Compatibility

The Node.js backend can:
1. ✅ Read existing data from the Next.js backend
2. ✅ Write data that the Next.js backend can read
3. ✅ Use the same database without conflicts
4. ✅ Maintain data integrity across both systems

## Migration Notes

No migration needed! The Node.js backend is designed to work with the existing database structure without any schema changes.
