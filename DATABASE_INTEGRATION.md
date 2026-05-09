# Database Integration Summary

## Overview
All data for the application is now being fetched from the database instead of using hardcoded mock data.

## API Routes Created/Updated

### 1. `/api/categories` - GET
Fetches all product categories from the database
- Returns: categories with id, name, slug, description, icon, order, productCount
- Used in: Home page for category filter

### 2. `/api/home` - GET
Fetches home page data including:
- Featured products (up to 10)
- Categories (up to 8)
- New products (up to 8)
- Best selling products (up to 8)
- Active vouchers (up to 5)

### 3. `/api/products` - GET (Existing)
Fetches products from database
- Query params: category, search
- Returns: products with full details including category info

### 4. `/api/cart` - GET, POST (Existing)
- GET: Fetch user's cart items
- POST: Add item to cart

### 5. `/api/cart/[id]` - PATCH, DELETE (New)
- PATCH: Update cart item quantity
- DELETE: Remove item from cart

### 6. `/api/orders` - GET (Existing)
Fetches user's order history with items and payments

### 7. `/api/auth/me` - GET (Existing)
Fetches current user data including:
- id, email, name, phone, address
- memberLevel, points, stampCount, starCount
- role, profilePhoto, theme, notificationSound

### 8. `/api/user/vouchers` - GET (Existing)
Fetches user's vouchers (regular + point vouchers)

## Frontend Integration

### src/app/page.tsx
Updated to fetch data from database:

1. **Categories** - NEW
   - State: `categories` with default "Semua" option
   - Fetch function: `fetchCategories()`
   - Called on component mount
   - API: `/api/categories`

2. **Products** - EXISTING (verified)
   - State: `products`
   - Fetch function: `fetchProducts()`
   - Called when category or search changes
   - API: `/api/products?category=...&search=...`

3. **User Data** - EXISTING (verified)
   - State: `user` from useStore
   - Fetch function: `checkAuth()`
   - Called on mount
   - API: `/api/auth/me`
   - Used for member barcode (user.phone)

4. **Orders** - EXISTING (verified)
   - State: `orders`
   - Fetch function: `fetchOrdersFromApi()`
   - Called when user logs in
   - API: `/api/orders`

5. **Cart** - EXISTING (verified)
   - State: `cart` from useStore
   - Managed through useStore hook
   - API: `/api/cart` (GET, POST)
   - API: `/api/cart/[id]` (PATCH, DELETE)

6. **Vouchers** - EXISTING (verified)
   - State: `vouchers`, `pointVouchers`
   - Fetch function: `fetchUserVouchers()`
   - Called when account tab is active
   - API: `/api/user/vouchers?userId=...`

## Database Models Used

### User
- Member data for barcode generation (phone number)
- Profile information (name, email, address, phone)
- Member level and points system
- Settings (theme, notificationSound)

### Category
- Product categories with icons
- Ordered display
- Product count

### Product
- Product details (name, description, price, stock)
- Discount information
- Category relationship
- Featured flag
- Rating and sold count

### CartItem
- User's shopping cart
- Product and quantity
- Unique constraint on userId + productId

### Order
- Order details (customer info, payment, status)
- Points earned/used
- QR code for payment

### OrderItem
- Items in order
- Price, quantity, discount, subtotal

### Payment
- Payment information
- Transaction status
- QR code and expiry

### Voucher
- Active vouchers
- Discount type and value
- Usage limits and tracking

### PointVoucher
- User's point redemption vouchers
- Product redemption
- Usage tracking

## Data Flow

### Home Page (Beranda)
```
Component Mount
  ↓
fetchCategories() → /api/categories
  ↓
fetchProducts() → /api/products
  ↓
Display products with category filter
```

### Shopping (Belanja)
```
User selects category
  ↓
fetchProducts() with category param
  ↓
Display filtered products
```

### Cart (Keranjang)
```
Add to cart → POST /api/cart
  ↓
Update quantity → PATCH /api/cart/[id]
  ↓
Remove item → DELETE /api/cart/[id]
  ↓
Get cart → GET /api/cart
```

### Checkout
```
Open checkout → fetch user data from store
  ↓
Submit order → POST /api/checkout
  ↓
Order created in database
  ↓
Fetch orders → GET /api/orders
```

### Orders (Pesanan)
```
User logs in → fetchOrdersFromApi()
  ↓
GET /api/orders
  ↓
Display order list with status
```

### Member Barcode
```
User logged in → user.phone available
  ↓
Generate barcode from phone number
  ↓
Display in member card
```

## Database Seeding

Initial data seeded via `prisma/seed.ts`:
- 5 categories: Makanan, Minuman, Snack, Bumbu, Kebutuhan Rumah
- 11 products across all categories
- Products with discounts and featured flags

Run seed command:
```bash
bun run db:seed
```

## Verification

All data is now fetched from database:
✓ Categories - NEW: /api/categories
✓ Products - Existing: /api/products
✓ User data - Existing: /api/auth/me
✓ Cart - Existing: /api/cart
✓ Orders - Existing: /api/orders
✓ Vouchers - Existing: /api/user/vouchers
✓ Member barcode - Uses user.phone from database

## Benefits

1. **Single Source of Truth**: All data comes from database
2. **Real-time Updates**: Changes in database reflected immediately
3. **Scalability**: Easy to add new data and features
4. **Consistency**: All features use same data source
5. **Maintainability**: Centralized data management
