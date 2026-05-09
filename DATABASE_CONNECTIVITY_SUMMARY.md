# Database Connectivity Summary - All Pages

## ✅ Beranda (Home)
**Status**: FULLY CONNECTED ✓

**Data Operations**:
- **Fetch Products**: `GET /api/products` - Fetches all products with optional category and search filters
- **Display**: Shows products in grid layout with category selection
- **Add to Cart**: Saves to Zustand store for checkout

**API Endpoints Used**:
- `/api/products` - Product listing with filters
- `/api/user/vouchers` - Fetch user vouchers (when in account tab)

**Data Flow**:
```
User selects category/search → API fetch → Products displayed → Add to cart → Checkout
```

---

## ✅ Belanja (Shop)
**Status**: FULLY CONNECTED ✓

**Data Operations**:
- **Fetch Products**: `GET /api/products?category=&search=` - Dynamic filtering
- **Categories**: Fetches products by category (makanan, minuman, snack, bumbu, kebutuhan-rumah)
- **Search**: Real-time search through product names
- **Add to Cart**: Updates Zustand store

**API Endpoints Used**:
- `/api/products` - Product listing with category/search parameters

**Features**:
- Category-based filtering
- Real-time search
- Discount price display
- Add to cart with quantity
- Stock tracking from database

---

## ✅ Tukar Point (Redeem Points)
**Status**: FULLY CONNECTED ✓

**Data Operations**:
- **Fetch Redemption Options**: `GET /api/point-redemption` - Get available point redemption options
- **Redeem Points**: `POST /api/point-redemption` - Exchange points for voucher
- **Mark Voucher Used**: `POST /api/point-voucher/use` - Mark point voucher as used after checkout
- **Apply Voucher**: Point vouchers can be applied in checkout

**API Endpoints Used**:
- `/api/point-redemption` - List redemption options and redeem points
- `/api/point-voucher/use` - Mark point voucher as used

**Data Flow**:
```
Fetch options → User selects option → Redeem points → Get voucher code → Use in checkout → Mark as used
```

**Features**:
- Display product image and price
- Show points required
- Show user's current points
- Validate sufficient points before redemption
- Generate unique voucher code
- Track voucher usage in database

---

## ✅ Pesanan (Orders)
**Status**: FULLY CONNECTED ✓

**Data Operations**:
- **Fetch Orders**: `GET /api/orders` - Fetch user's order history
- **Create Order**: `POST /api/checkout` - Create new order from cart
- **Verify Payment**: `POST /api/payment/verify` - Verify manual payment proof
- **Generate QRIS**: `POST /api/qrcode/generate` - Generate QRIS for payment
- **Auto-poll**: Periodic check for payment status updates
- **Print Receipt**: Generate printable receipt from order data

**API Endpoints Used**:
- `/api/orders` - Fetch user orders
- `/api/checkout` - Create new order
- `/api/payment/verify` - Verify payment proof (upload)
- `/api/qrcode/generate` - Generate QRIS QR code
- `/api/point-voucher/use` - Mark point voucher as used

**Order Status Flow**:
```
pending → processing → shipped → completed
pending → paid → verified → completed
pending → failed → cancelled
```

**Features**:
- Order history with status badges
- Order detail modal with items list
- Payment proof upload (screenshot)
- QRIS code generation for QRIS payments
- Automatic payment status polling
- Print receipt functionality
- Track voucher usage in orders
- Calculate and award points from purchases
- Mark point vouchers as used when applied

---

## ✅ Akun (Account)
**Status**: FULLY CONNECTED ✓

**Data Operations**:
- **Fetch Profile**: Auth check via `/api/auth/me` - Get current user data
- **Update Profile**: `PUT /api/user/profile` - Update name, phone, address, profile photo
- **Update Email**: `PUT /api/user/email` - Change email with password verification
- **Update Phone**: `PUT /api/user/phone` - Change phone with password verification
- **Update Address**: `PUT /api/user/address` - Change address with password verification
- **Fetch Vouchers**: `GET /api/user/vouchers?userId=` - Get regular and point vouchers
- **Forgot Password**: `POST /api/auth/forgot-password` - Initiate password reset
- **Reset Password**: `POST /api/auth/reset-password` - Complete password reset

**API Endpoints Used**:
- `/api/auth/me` - Get current user
- `/api/user/profile` - Update profile (name, phone, address, photo)
- `/api/user/email` - Update email
- `/api/user/phone` - Update phone
- `/api/user/address` - Update address
- `/api/user/vouchers` - Fetch user vouchers
- `/api/auth/forgot-password` - Request password reset
- `/api/auth/reset-password` - Complete password reset
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/auth/me` (DELETE) - User logout

**Profile Features**:
- Member card with barcode/QR code
- Membership level (Bronze, Silver, Gold, Platinum, VIP)
- Points progress bar
- Edit profile photo with base64 encoding
- Update personal information
- Change email with password verification
- Change phone with password verification
- Change address with password verification
- View all user vouchers (regular + point vouchers)
- Copy voucher codes
- "Pakai" voucher buttons (navigate to checkout)

**Security Features**:
- Password required for sensitive changes (email, phone, address)
- Forgot password with email + phone verification
- Reset password with token
- Session management via Zustand store
- Auto-login for admin users

---

## 📊 Cart System (Zustand Store)
**Status**: FULLY CONNECTED ✓

**Data Operations**:
- **Add to Cart**: `addToCart(product)` - Add item or update quantity
- **Update Quantity**: `updateCartQuantity(productId, quantity)` - Change item quantity
- **Remove from Cart**: `removeFromCart(productId)` - Remove item from cart
- **Clear Cart**: `clearCart()` - Empty cart after checkout
- **Persistent Storage**: localStorage via Zustand persist middleware

**Cart Item Structure**:
```typescript
interface CartItem {
  productId: string
  name: string
  price: number
  discountPrice?: number
  quantity: number
  image?: string
  barcode?: string
  category?: string
  isFree?: boolean (for point vouchers)
}
```

---

## 📋 Summary

### ✅ All Pages Are Connected to Database

| Page | Read Data | Write Data | API Endpoints | Status |
|------|-----------|-------------|---------------|--------|
| Beranda | ✓ | ✓ | /api/products | ✅ Connected |
| Belanja | ✓ | ✓ | /api/products | ✅ Connected |
| Tukar Point | ✓ | ✓ | /api/point-redemption, /api/point-voucher/use | ✅ Connected |
| Pesanan | ✓ | ✓ | /api/orders, /api/checkout, /api/payment/verify, /api/qrcode/generate | ✅ Connected |
| Akun | ✓ | ✓ | /api/user/*, /api/auth/* | ✅ Connected |

### 🔄 Complete Data Flow

```
User Registration/Login → Session Created (token)
       ↓
Beranda/Belanja → Browse Products (from /api/products)
       ↓
Add to Cart (Zustand store)
       ↓
Checkout → Create Order (/api/checkout)
       ↓
Order Created → Points Earned, Vouchers Used
       ↓
Payment → Upload Proof (/api/payment/verify) or QRIS
       ↓
Order Status Update → Auto-poll
       ↓
Pesanan Tab → View Order History
       ↓
Tukar Point → Redeem Points (/api/point-redemption)
       ↓
Get Voucher → Use in Next Order
       ↓
Voucher Used (/api/point-voucher/use)
       ↓
Akun Tab → Update Profile, View Vouchers
```

### 🎯 Key Features

1. **Real-time Data**: All data fetched from database in real-time
2. **Persistent Auth**: Session stored in localStorage with auto-login for admin
3. **Order Tracking**: Complete order lifecycle from creation to completion
4. **Point System**: Earn points from purchases, redeem points for products
5. **Voucher System**: Regular discounts and point-based free products
6. **Profile Management**: Full CRUD for user profile with security
7. **Cart System**: Stateful shopping cart with persistence
8. **Payment Verification**: Manual proof upload and QRIS support
9. **Receipt Printing**: Generate printable order receipts
10. **Search & Filter**: Real-time product search and category filtering

### 📁 Updated Components

- **HomeDashboard**: Updated to use real data from props (cartCount, orders, vouchers)
- **VoucherManagement**: Connected to /api/admin/vouchers with full CRUD
- **Admin Pages**: All admin pages already connected to database

### 🚀 All Systems Operational

All main pages (Beranda, Belanja, Tukar Point, Pesanan, Akun) are now:
- ✅ Reading data from database via API endpoints
- ✅ Writing data to database via API endpoints
- ✅ Using real user sessions with JWT authentication
- ✅ Persisting data using Zustand store with localStorage
- ✅ Providing complete user experience from browsing to checkout to order tracking
