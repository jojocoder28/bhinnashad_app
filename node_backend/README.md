# Bhinna Shad Backend API

Complete Node.js/Express backend API for the Bhinna Shad Restaurant Management System.

## Features

- ✅ **Authentication** - JWT-based auth with role-based access control
- ✅ **User Management** - CRUD operations for users with approval workflow
- ✅ **Menu Management** - Complete menu item management with ingredient tracking
- ✅ **Order Management** - Full order lifecycle (pending → approved → prepared → served → billed)
- ✅ **Table Management** - Real-time table status tracking
- ✅ **Billing System** - Generate and manage bills for orders
- ✅ **Stock Management** - Track inventory levels and costs
- ✅ **Supplier Management** - Manage supplier information
- ✅ **Purchase Orders** - Create and track purchase orders
- ✅ **Stock Usage Logs** - Record stock usage and wastage
- ✅ **Online Orders** - Support for online/pickup orders
- ✅ **Reports & Analytics** - Revenue, orders, staff performance, menu analytics

## Database Compatibility

⚠️ **IMPORTANT**: This backend uses the **exact same MongoDB database and schema** as the existing Next.js backend.

- Database Name: `bhinna_shad`
- All collection names match exactly
- All field names and types match exactly
- No migration needed - works seamlessly with existing data

See [SCHEMA_ALIGNMENT.md](./SCHEMA_ALIGNMENT.md) for detailed schema documentation.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment variables** are already configured in `.env`

3. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

Server will run on `http://localhost:9002`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `POST /refresh` - Refresh JWT token

### Users (`/api/users`)
- `GET /` - Get all users (admin/manager)
- `GET /:id` - Get user by ID
- `POST /` - Create user (admin)
- `PUT /:id` - Update user (admin/manager)
- `DELETE /:id` - Delete user (admin)
- `PATCH /:id/approve` - Approve user (admin/manager)

### Menu (`/api/menu`)
- `GET /` - Get all menu items (public)
- `GET /:id` - Get menu item by ID
- `POST /` - Create menu item (admin/manager)
- `PUT /:id` - Update menu item (admin/manager)
- `DELETE /:id` - Delete menu item (admin/manager)
- `PATCH /:id/availability` - Toggle availability (admin/manager)
- `GET /categories/list` - Get all categories

### Orders (`/api/orders`)
- `GET /` - Get all orders (filtered by role)
- `GET /:id` - Get order by ID
- `POST /` - Create order (waiter/manager/admin)
- `PATCH /:id/status` - Update order status
- `POST /:id/cancel` - Cancel order with reason

### Tables (`/api/tables`)
- `GET /` - Get all tables
- `GET /:id` - Get table by ID
- `POST /` - Create table (admin/manager)
- `PATCH /:id/status` - Update table status
- `DELETE /:id` - Delete table (admin)

### Waiters (`/api/waiters`)
- `GET /` - Get all waiters
- `GET /:id` - Get waiter by ID
- `POST /` - Create waiter (admin/manager)
- `DELETE /:id` - Delete waiter (admin)

### Bills (`/api/bills`)
- `GET /` - Get all bills
- `GET /:id` - Get bill by ID
- `POST /table/:tableNumber` - Create bill for table
- `PATCH /:id/pay` - Mark bill as paid

### Stock Management (`/api/stock`)

**Stock Items**
- `GET /items` - Get all stock items
- `POST /items` - Create stock item (admin/manager)
- `PUT /items/:id` - Update stock item (admin/manager)
- `DELETE /items/:id` - Delete stock item (admin)

**Suppliers**
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create supplier (admin/manager)
- `PUT /suppliers/:id` - Update supplier (admin/manager)
- `DELETE /suppliers/:id` - Delete supplier (admin)

**Purchase Orders**
- `GET /purchase-orders` - Get all purchase orders
- `POST /purchase-orders` - Create purchase order (admin/manager)
- `PATCH /purchase-orders/:id/status` - Update PO status (admin/manager)

**Stock Usage Logs**
- `GET /usage-logs` - Get stock usage logs
- `POST /usage-logs` - Record stock usage (admin/manager)

### Reports (`/api/reports`)
- `GET /revenue` - Revenue report (admin/manager)
- `GET /orders` - Orders report (admin/manager)
- `GET /staff` - Staff performance (admin/manager)
- `GET /menu` - Menu performance (admin/manager)
- `GET /dashboard` - Dashboard summary

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **admin** - Full system access
- **manager** - Order approval, menu management, stock management, reports
- **waiter** - Order creation, table management, billing
- **user** - Customer role for online orders

## Demo Accounts

The server automatically seeds demo accounts on first run:

- **Admin**: `admin@bhinnashad.com`
- **Manager**: `manager@bhinnashad.com`
- **Waiter**: `arjun@bhinnashad.com`

Password for all: `123456`

**Note**: These accounts match the existing Next.js backend accounts.

## Database

MongoDB connection is configured in `.env`:
```
MONGODB_URI=mongodb+srv://marik:iwcqP1s38lXz6Izq@cluster0.heyuomr.mongodb.net/bhinna_shad?retryWrites=true&w=majority&appName=Cluster0
```

## Error Handling

The API uses consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

## Testing the API

You can test the API using:
- **Postman** - Import the endpoints
- **cURL** - Command line testing
- **Flutter App** - The mobile app is configured to use this API

Example login request:
```bash
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bhinnashad.com","password":"123456"}'
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a process manager like PM2
3. Set up proper MongoDB connection
4. Configure CORS for your domain
5. Use HTTPS in production

## License

ISC
