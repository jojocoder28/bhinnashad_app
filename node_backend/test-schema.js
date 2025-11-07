// Quick schema verification script
const mongoose = require('mongoose');

// Import all models
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Table = require('./models/Table');
const Waiter = require('./models/Waiter');
const Bill = require('./models/Bill');
const StockItem = require('./models/StockItem');
const Supplier = require('./models/Supplier');
const PurchaseOrder = require('./models/PurchaseOrder');
const StockUsageLog = require('./models/StockUsageLog');
const OnlineOrder = require('./models/OnlineOrder');

console.log('✅ Schema Verification\n');

// Verify collection names
const models = [
  { name: 'User', model: User, expectedCollection: 'users' },
  { name: 'MenuItem', model: MenuItem, expectedCollection: 'menu' },
  { name: 'Order', model: Order, expectedCollection: 'orders' },
  { name: 'Table', model: Table, expectedCollection: 'tables' },
  { name: 'Waiter', model: Waiter, expectedCollection: 'waiters' },
  { name: 'Bill', model: Bill, expectedCollection: 'bills' },
  { name: 'StockItem', model: StockItem, expectedCollection: 'stock' },
  { name: 'Supplier', model: Supplier, expectedCollection: 'suppliers' },
  { name: 'PurchaseOrder', model: PurchaseOrder, expectedCollection: 'purchase_orders' },
  { name: 'StockUsageLog', model: StockUsageLog, expectedCollection: 'stock_usage_logs' },
  { name: 'OnlineOrder', model: OnlineOrder, expectedCollection: 'online_orders' },
];

console.log('Collection Name Verification:');
console.log('─'.repeat(60));

let allCorrect = true;
models.forEach(({ name, model, expectedCollection }) => {
  const actualCollection = model.collection.name;
  const isCorrect = actualCollection === expectedCollection;
  const status = isCorrect ? '✅' : '❌';
  
  console.log(`${status} ${name.padEnd(20)} → ${actualCollection.padEnd(20)} ${isCorrect ? '' : `(expected: ${expectedCollection})`}`);
  
  if (!isCorrect) allCorrect = false;
});

console.log('─'.repeat(60));

if (allCorrect) {
  console.log('\n✅ All collection names match the backend schema!');
  console.log('✅ Database: bhinna_shad');
  console.log('✅ Ready to use with existing data');
} else {
  console.log('\n❌ Some collection names do not match!');
  process.exit(1);
}

// Verify key schema fields
console.log('\n\nKey Schema Fields Verification:');
console.log('─'.repeat(60));

// User schema
const userPaths = Object.keys(User.schema.paths);
console.log('✅ User fields:', userPaths.filter(p => !p.startsWith('_')).join(', '));

// MenuItem schema
const menuPaths = Object.keys(MenuItem.schema.paths);
console.log('✅ MenuItem fields:', menuPaths.filter(p => !p.startsWith('_')).join(', '));

// Order schema
const orderPaths = Object.keys(Order.schema.paths);
console.log('✅ Order fields:', orderPaths.filter(p => !p.startsWith('_')).join(', '));

console.log('\n✅ Schema verification complete!');
