# Quick Start Guide

## ✅ Ready to Use!

The Node.js backend is fully configured and ready to work with your existing MongoDB database.

## Start the Server

```bash
# Navigate to the backend folder
cd node_backend

# Start in development mode (with auto-reload)
npm run dev

# OR start in production mode
npm start
```

Server will be available at: **http://localhost:9002**

## Test the API

### 1. Health Check
```bash
curl http://localhost:9002/api/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

### 2. Login with Existing Account
```bash
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bhinnashad.com","password":"123456"}'
```

You'll receive a JWT token in the response.

### 3. Get Menu Items (Public)
```bash
curl http://localhost:9002/api/menu
```

This should return existing menu items from your database.

### 4. Get Orders (Requires Auth)
```bash
curl http://localhost:9002/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Replace `YOUR_JWT_TOKEN` with the token from step 2.

## Available Accounts

These accounts already exist in your database:

| Email | Password | Role |
|-------|----------|------|
| admin@bhinnashad.com | 123456 | admin |
| manager@bhinnashad.com | 123456 | manager |
| arjun@bhinnashad.com | 123456 | waiter |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id/approve` - Approve user

### Menu
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Tables
- `GET /api/tables` - Get tables
- `POST /api/tables` - Create table
- `PATCH /api/tables/:id/status` - Update table status

### Bills
- `GET /api/bills` - Get bills
- `POST /api/bills/table/:tableNumber` - Create bill
- `PATCH /api/bills/:id/pay` - Mark bill as paid

### Stock Management
- `GET /api/stock/items` - Get stock items
- `GET /api/stock/suppliers` - Get suppliers
- `GET /api/stock/purchase-orders` - Get purchase orders
- `GET /api/stock/usage-logs` - Get usage logs

## Verify Schema Alignment

Run the verification script to confirm everything matches:

```bash
node test-schema.js
```

Expected output:
```
✅ All collection names match the backend schema!
✅ Database: bhinna_shad
✅ Ready to use with existing data
```

## Documentation

- **[README.md](./README.md)** - Complete API documentation
- **[SCHEMA_ALIGNMENT.md](./SCHEMA_ALIGNMENT.md)** - Detailed schema comparison
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Setup summary

## Troubleshooting

### Port Already in Use
If port 9002 is already in use, change it in `.env`:
```
PORT=9003
```

### MongoDB Connection Error
Check your `.env` file has the correct MongoDB URI:
```
MONGODB_URI=enter_your_mongodb_uri
```

### JWT Secret
The JWT secret is already configured in `.env`:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Next Steps

1. ✅ Start the server
2. ✅ Test with Postman or curl
3. ✅ Integrate with your Flutter app
4. ✅ Deploy to production

## Production Deployment

For production:
1. Set `NODE_ENV=production` in environment
2. Use a strong JWT secret
3. Enable HTTPS
4. Use a process manager (PM2)
5. Set up proper logging

---

**Status**: ✅ Ready to Use
**Database**: ✅ Connected to existing database
**Schema**: ✅ 100% Compatible
