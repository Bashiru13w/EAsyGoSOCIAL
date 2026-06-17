# EASYgoSocial - JavaScript Architecture Documentation

## 🏗️ Overview

The application has been refactored with a **modular, class-based architecture** that follows best practices for scalability, maintainability, and extensibility. All functionality is now organized into separate managers that handle specific concerns.

---

## 📁 Project Structure

```
EAsyGoSOCIAL/
├── index.html              # Main HTML file
├── acces/
│   └── css/
│       └── style.css       # Styling
├── js/
│   └── app.js              # Main application module
└── README.md               # This file
```

---

## 🏛️ Architecture Components

### 1. **WalletManager**
Manages all wallet-related operations including balance, transactions, and persistence.

**Key Methods:**
- `topUp(amount)` - Add funds to wallet
- `deduct(amount, description)` - Remove funds from wallet
- `getBalance()` - Get current balance
- `getTransactions(limit)` - Get transaction history
- `hasSufficientBalance(amount)` - Check if balance is enough
- `subscribe(callback)` - Listen for balance changes

**Features:**
- ✅ LocalStorage persistence
- ✅ Transaction history tracking
- ✅ Event listener pattern for reactive updates
- ✅ Static formatter for NGN currency

```javascript
// Usage Example
const wallet = new WalletManager();
wallet.topUp(5000);
wallet.subscribe((newBalance) => {
  console.log(`Balance updated: ₦${newBalance}`);
});
```

---

### 2. **OrderManager**
Handles order creation, tracking, and status management.

**Key Methods:**
- `createOrder(productName, price, quantity)` - Create new order
- `updateOrderStatus(orderId, status)` - Update order status
- `getOrders()` - Get all orders
- `getRecentOrders(limit)` - Get recent orders
- `getPendingOrders()` - Get orders awaiting delivery
- `subscribe(callback)` - Listen for order changes

**Features:**
- ✅ Order persistence in localStorage
- ✅ Status tracking (pending, delivered)
- ✅ Timestamp recording
- ✅ Event notifications

```javascript
// Usage Example
const orders = new OrderManager();
const order = orders.createOrder('Premium Logs', 3000);
orders.updateOrderStatus(order.id, 'delivered');
```

---

### 3. **NotificationManager**
Displays user-friendly messages with automatic dismissal.

**Key Methods:**
- `show(message, type, duration)` - Show generic notification
- `success(message, duration)` - Show success message
- `error(message, duration)` - Show error message
- `warning(message, duration)` - Show warning message
- `info(message, duration)` - Show info message

**Features:**
- ✅ Type-based styling (success, error, warning, info)
- ✅ Auto-dismissal after duration
- ✅ Customizable display time
- ✅ Safe DOM queries

```javascript
// Usage Example
const notifications = new NotificationManager();
notifications.success('Purchase successful!', 5000);
notifications.error('Insufficient balance', 5000);
```

---

### 4. **ModalManager**
Manages checkout modal and confirmations.

**Key Methods:**
- `open(title, message, onConfirm, confirmText)` - Open modal
- `close()` - Close modal
- `onConfirm(callback)` - Set confirmation handler

**Features:**
- ✅ Reusable modal component
- ✅ Click-outside dismissal
- ✅ Custom callback handling
- ✅ Dynamic content updates

```javascript
// Usage Example
const modal = new ModalManager();
modal.open(
  'Confirm Purchase',
  'Deduct ₦5,000 from wallet?',
  () => console.log('Confirmed'),
  'Proceed'
);
```

---

### 5. **CheckoutManager**
Orchestrates the purchase flow with validation and notifications.

**Key Methods:**
- `processPurchase(productName, price, quantity)` - Process payment
- `showCheckout(productName, price)` - Display checkout modal

**Features:**
- ✅ Balance validation
- ✅ Automatic transaction recording
- ✅ Seller alerts
- ✅ Error handling with user feedback

```javascript
// Usage Example
const checkout = new CheckoutManager(wallet, orders, notifications, modal);
checkout.showCheckout('Premium Logs', 3000);
```

---

### 6. **FormValidator**
Static utility for input validation across the application.

**Key Methods:**
- `isValidEmail(email)` - Validate email format
- `isValidPhone(phone)` - Validate phone format
- `validateRequired(value, fieldName)` - Check required field
- `validateAmount(value)` - Validate currency amount

**Features:**
- ✅ Regex-based validation
- ✅ Clear error messages
- ✅ Reusable across forms
- ✅ Type-safe returns

```javascript
// Usage Example
try {
  FormValidator.validateRequired(name, 'Name');
  if (!FormValidator.isValidEmail(email)) {
    throw new Error('Invalid email');
  }
} catch (error) {
  notifications.error(error.message);
}
```

---

### 7. **UIManager**
Manages all user interface interactions and DOM updates.

**Key Methods:**
- `updateWalletDisplay(balance)` - Update balance display
- `setupBuyButtons(callback)` - Setup purchase buttons
- `setupTopUpButton(callback)` - Setup top-up button
- `setupOrderForm(callback)` - Setup order form
- `clearOrderForm()` - Reset form fields

**Features:**
- ✅ Centralized DOM element management
- ✅ Event listener setup
- ✅ Form state management
- ✅ Clean separation of concerns

```javascript
// Usage Example
const ui = new UIManager();
ui.setupBuyButtons((name, price) => {
  checkout.showCheckout(name, price);
});
```

---

### 8. **App (Main Controller)**
Orchestrates all managers and initializes the application.

**Key Methods:**
- `init()` - Initialize application
- `getWallet()` - Access wallet manager
- `getOrders()` - Access orders manager
- `handleOrderSubmit(form)` - Process custom orders

**Features:**
- ✅ Single initialization point
- ✅ Error handling and logging
- ✅ Manager composition
- ✅ Global access via `window.app`

```javascript
// Usage Example (automatically initialized)
window.app.getWallet().topUp(2000);
window.app.getOrders().createOrder('Bulk Logs', 5500);
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────┐
│         User Interaction (Click/Form)           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
         ┌─────────────────────┐
         │   UIManager         │
         │ (Event Listeners)   │
         └────────┬────────────┘
                  │
                  ▼
      ┌───────────────────────────┐
      │  CheckoutManager.show()   │
      │  (Validation & Modal)     │
      └────────┬──────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  User Confirms Purchase      │
    └────────┬─────────────────────┘
             │
             ▼
  ┌─────────────────────────────────┐
  │ CheckoutManager.process()       │
  │  - Validate Balance             │
  │  - Deduct from Wallet           │
  │  - Create Order                 │
  │  - Update Seller Alert          │
  └────────┬────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Wallet Updated → Notify Listeners   │
│  Order Created → Update Dashboard    │
│  Transaction Recorded → Show Success │
└──────────────────────────────────────┘
```

---

## 💾 localStorage Keys

The application stores data locally using these keys:

| Key | Purpose | Example |
|-----|---------|---------|
| `easysocial-wallet-balance` | Current wallet balance | `"8000"` |
| `easysocial-transactions` | Transaction history | JSON array |
| `easysocial-orders` | Order history | JSON array |

---

## 🎯 Usage Examples

### Example 1: Complete Purchase Flow

```javascript
// 1. Initialize (automatic on page load)
const app = window.app;

// 2. Check balance
console.log(app.getWallet().getBalance());

// 3. Show checkout modal
app.checkout.showCheckout('Premium Logs', 3000);

// 4. User confirms → Purchase processed automatically
// Balance decremented, order created, seller notified
```

### Example 2: Top-Up Wallet

```javascript
try {
  app.getWallet().topUp(5000);
  app.notifications.success('Wallet topped up with ₦5,000');
} catch (error) {
  app.notifications.error(error.message);
}
```

### Example 3: Get Transaction History

```javascript
const transactions = app.getWallet().getTransactions(10);
transactions.forEach(tx => {
  console.log(`${tx.type}: ₦${tx.amount} - ${tx.description}`);
});
```

### Example 4: Monitor Balance Changes

```javascript
app.getWallet().subscribe((newBalance) => {
  console.log(`Balance changed to: ₦${newBalance}`);
  // Update UI, sync server, etc.
});
```

---

## 🔐 Error Handling

The application includes comprehensive error handling:

```javascript
// Wallet Operations
try {
  wallet.deduct(10000, 'Purchase');
} catch (error) {
  // "Insufficient balance. You need ₦2,000 more."
  notifications.error(error.message);
}

// Form Validation
try {
  FormValidator.validateRequired(name, 'Name');
} catch (error) {
  // "Name is required."
  notifications.error(error.message);
}

// Initialization
try {
  app.init();
} catch (error) {
  console.error('Failed to initialize app:', error);
}
```

---

## 📊 localStorage Persistence

All data is automatically persisted:

```javascript
// Wallet
localStorage.setItem('easysocial-wallet-balance', '8000');

// Transactions
localStorage.setItem('easysocial-transactions', JSON.stringify([
  {
    id: 1624999999999,
    type: 'credit',
    amount: 5000,
    description: 'Wallet Top Up',
    status: 'completed',
    timestamp: '2026-06-17T01:00:00.000Z'
  }
]));

// Orders
localStorage.setItem('easysocial-orders', JSON.stringify([
  {
    id: 1624999999998,
    productName: 'Premium Logs',
    price: 3000,
    quantity: 1,
    total: 3000,
    status: 'pending',
    createdAt: '2026-06-17T01:05:00.000Z',
    deliveredAt: null
  }
]));
```

---

## 🚀 Adding New Features

### Add a New Manager

```javascript
class AnalyticsManager {
  constructor() {
    this.events = [];
  }

  track(eventName, data) {
    this.events.push({
      name: eventName,
      data,
      timestamp: new Date().toISOString()
    });
  }

  getEvents() {
    return this.events;
  }
}

// Integrate in App class
class App {
  constructor() {
    // ... existing managers
    this.analytics = new AnalyticsManager();
  }
  
  init() {
    // ... existing setup
    this.analytics.track('app_initialized', { timestamp: new Date() });
  }
}
```

### Add a New Event Handler

```javascript
// In UIManager
setupCustomButton(selector, callback) {
  const button = document.querySelector(selector);
  if (button) {
    button.addEventListener('click', callback);
  }
}

// In App.init()
this.ui.setupCustomButton('#myButton', () => {
  this.analytics.track('custom_button_clicked');
});
```

---

## 🧪 Testing

```javascript
// Test Wallet
const wallet = new WalletManager('test-wallet', 10000);
wallet.topUp(5000);
console.assert(wallet.getBalance() === 15000, 'Top-up failed');

// Test Orders
const orders = new OrderManager();
const order = orders.createOrder('Test Product', 1000);
console.assert(order.status === 'pending', 'Order creation failed');

// Test Notifications
const notif = new NotificationManager('#testContainer');
notif.success('Test message');
```

---

## 📋 Best Practices

1. **Always validate inputs** - Use FormValidator before processing
2. **Handle errors gracefully** - Show user-friendly error messages
3. **Use notifications** - Keep users informed of all actions
4. **Persist important data** - Use wallet.save() and orders.saveOrders()
5. **Subscribe to changes** - Use observer pattern for reactive updates
6. **Keep managers focused** - Each manager has one responsibility
7. **Test edge cases** - Insufficient balance, invalid input, etc.

---

## 🐛 Debugging

```javascript
// Access any manager
console.log(window.app.getWallet());
console.log(window.app.getOrders());

// Check localStorage
console.log(localStorage.getItem('easysocial-wallet-balance'));
console.log(localStorage.getItem('easysocial-transactions'));

// Monitor events
window.app.getWallet().subscribe(balance => {
  console.log('Wallet balance:', balance);
});
```

---

## 📦 Module Export

For use in other projects or bundlers:

```javascript
// CommonJS
const { App, WalletManager, OrderManager } = require('./js/app.js');

// ES6 Modules (after conversion)
import { App, WalletManager } from './js/app.js';
```

---

## 🔄 Future Enhancements

- [ ] Backend API integration for persistence
- [ ] User authentication system
- [ ] Payment gateway integration
- [ ] Real-time order notifications
- [ ] Analytics and reporting
- [ ] Multi-currency support
- [ ] Refund system
- [ ] Review and ratings system

---

## 📝 License

© 2026 EASYgoSocial. All rights reserved.

---

**For questions or suggestions, please contact the development team.**
