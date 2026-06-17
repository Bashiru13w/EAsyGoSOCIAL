// Quick Reference Guide - Copy and paste ready code snippets

// ============================================
// 1. WALLET MANAGEMENT
// ============================================

// Get wallet manager
const wallet = window.app.getWallet();

// Check current balance
const balance = wallet.getBalance();
console.log(`Balance: ${balance}`);

// Top up wallet
wallet.topUp(5000);  // Add ₦5,000

// Deduct from wallet
wallet.deduct(3000, 'Purchase: Premium Logs');

// Check if balance is sufficient
if (wallet.hasSufficientBalance(2000)) {
  console.log('Can purchase');
} else {
  console.log('Insufficient balance');
}

// Get transaction history
const transactions = wallet.getTransactions(10);  // Last 10 transactions
transactions.forEach(tx => {
  console.log(`${tx.timestamp}: ${tx.type} ₦${tx.amount} - ${tx.description}`);
});

// Listen for balance changes
wallet.subscribe((newBalance) => {
  console.log(`New balance: ₦${newBalance}`);
  // Update UI, sync with server, etc.
});

// Format currency to NGN
const formatted = wallet.constructor.formatNGN(5000);
console.log(formatted);  // ₦5,000


// ============================================
// 2. ORDER MANAGEMENT
// ============================================

// Get orders manager
const orders = window.app.getOrders();

// Create new order
const order = orders.createOrder('Premium Logs', 3000, 1);
console.log(`Order created: #${order.id}`);

// Get all orders
const allOrders = orders.getOrders();
console.log(allOrders);

// Get recent orders (last 5)
const recent = orders.getRecentOrders(5);
recent.forEach(order => {
  console.log(`${order.productName}: ${order.status}`);
});

// Get pending orders
const pending = orders.getPendingOrders();
console.log(`Pending: ${pending.length}`);

// Update order status
orders.updateOrderStatus(order.id, 'delivered');

// Listen for order changes
orders.subscribe((updatedOrders) => {
  console.log('Orders updated:', updatedOrders);
});


// ============================================
// 3. NOTIFICATIONS
// ============================================

// Get notifications manager
const notifications = window.app.notifications;

// Show success message
notifications.success('Purchase successful!', 5000);

// Show error message
notifications.error('Insufficient balance', 5000);

// Show warning message
notifications.warning('Low balance warning', 5000);

// Show info message
notifications.info('Order processing...', 5000);

// Show custom notification
notifications.show('Custom message', 'success', 3000);


// ============================================
// 4. CHECKOUT & PURCHASES
// ============================================

// Get checkout manager
const checkout = window.app.checkout;

// Show checkout modal
checkout.showCheckout('Premium Logs', 3000);

// Process purchase directly (use with caution)
try {
  const order = checkout.processPurchase('Premium Logs', 3000, 1);
  console.log('Purchase successful:', order);
} catch (error) {
  console.error('Purchase failed:', error.message);
}


// ============================================
// 5. FORM VALIDATION
// ============================================

// Validate email
if (FormValidator.isValidEmail('user@example.com')) {
  console.log('Valid email');
}

// Validate phone
if (FormValidator.isValidPhone('+2348012345678')) {
  console.log('Valid phone');
}

// Validate required field
try {
  FormValidator.validateRequired(inputValue, 'Email');
} catch (error) {
  console.error(error.message);
}

// Validate amount
try {
  const amount = FormValidator.validateAmount(5000);
  console.log('Valid amount:', amount);
} catch (error) {
  console.error(error.message);
}


// ============================================
// 6. COMPLETE PURCHASE FLOW
// ============================================

// Step 1: Check balance
if (window.app.getWallet().hasSufficientBalance(3000)) {
  
  // Step 2: Show checkout
  window.app.checkout.showCheckout('Premium Logs', 3000);
  
  // Step 3: User confirms in modal → Purchase completed automatically
  // (Modal confirmation triggers processPurchase internally)
  
} else {
  
  // Show top-up prompt
  window.app.notifications.error('Please add funds to your wallet');
}


// ============================================
// 7. CUSTOM ORDER FLOW
// ============================================

// Get order form
const orderForm = document.getElementById('orderForm');

// Validate and extract form data
const name = orderForm.querySelector('#name').value.trim();
const phone = orderForm.querySelector('#phone').value.trim();
const product = orderForm.querySelector('#product').value;

// Validate inputs
try {
  FormValidator.validateRequired(name, 'Name');
  FormValidator.validateRequired(phone, 'Phone');
  
  if (!FormValidator.isValidPhone(phone)) {
    throw new Error('Invalid phone number');
  }
  
  // Create order
  const order = window.app.getOrders().createOrder(product, 0, 1);
  window.app.notifications.success('Order placed successfully!');
  
} catch (error) {
  window.app.notifications.error(error.message);
}


// ============================================
// 8. MODAL OPERATIONS
// ============================================

// Get modal manager
const modal = window.app.modal;

// Open modal with custom content
modal.open(
  'Confirm Purchase',
  'This will deduct ₦5,000 from your balance',
  () => {
    console.log('User confirmed');
  },
  'Proceed'
);

// Close modal
modal.close();


// ============================================
// 9. ADVANCED: SUBSCRIBE TO MULTIPLE EVENTS
// ============================================

// Monitor wallet and orders together
window.app.getWallet().subscribe((balance) => {
  console.log('Balance changed:', balance);
  document.getElementById('walletBalance').textContent = 
    window.app.constructor.formatNGN(balance);
});

window.app.getOrders().subscribe((orders) => {
  console.log('Orders changed:', orders.length);
  updateDashboard(orders);
});

function updateDashboard(orders) {
  const pending = orders.filter(o => o.status === 'pending').length;
  document.getElementById('pendingCount').textContent = pending;
}


// ============================================
// 10. DATA ACCESS & DEBUGGING
// ============================================

// Access localStorage directly
const balance = localStorage.getItem('easysocial-wallet-balance');
const transactions = JSON.parse(localStorage.getItem('easysocial-transactions') || '[]');
const orders = JSON.parse(localStorage.getItem('easysocial-orders') || '[]');

console.log('Current balance:', balance);
console.log('Transaction count:', transactions.length);
console.log('Order count:', orders.length);

// Clear all data (reset app)
function resetApp() {
  localStorage.removeItem('easysocial-wallet-balance');
  localStorage.removeItem('easysocial-transactions');
  localStorage.removeItem('easysocial-orders');
  location.reload();
}

// Export data as JSON
function exportData() {
  const data = {
    balance: localStorage.getItem('easysocial-wallet-balance'),
    transactions: JSON.parse(localStorage.getItem('easysocial-transactions') || '[]'),
    orders: JSON.parse(localStorage.getItem('easysocial-orders') || '[]')
  };
  console.log(JSON.stringify(data, null, 2));
  return data;
}


// ============================================
// 11. ERROR HANDLING PATTERNS
// ============================================

// Pattern 1: Try-catch with notification
try {
  window.app.getWallet().deduct(5000, 'Purchase');
} catch (error) {
  window.app.notifications.error(error.message);
}

// Pattern 2: Conditional with message
if (!window.app.getWallet().hasSufficientBalance(5000)) {
  window.app.notifications.warning('Insufficient balance. Please add funds.');
  window.app.checkout.showCheckout('Top-up', 0);  // Show top-up flow
}

// Pattern 3: Promise-like handling
async function purchaseAsync(name, price) {
  try {
    const result = await new Promise((resolve, reject) => {
      try {
        const order = window.app.checkout.processPurchase(name, price);
        resolve(order);
      } catch (error) {
        reject(error);
      }
    });
    return result;
  } catch (error) {
    window.app.notifications.error(error.message);
  }
}


// ============================================
// 12. INTEGRATION EXAMPLES
// ============================================

// Example 1: Show balance in custom element
function updateBalanceWidget() {
  const balance = window.app.getWallet().getBalance();
  document.querySelector('.balance-widget').textContent = 
    `₦${balance.toLocaleString('en-NG')}`;
}
updateBalanceWidget();
window.app.getWallet().subscribe(updateBalanceWidget);

// Example 2: Track user journey
function trackPurchase(productName, price) {
  const event = {
    action: 'purchase',
    product: productName,
    amount: price,
    timestamp: new Date().toISOString(),
    balance: window.app.getWallet().getBalance()
  };
  console.log('Event tracked:', event);
  // Send to analytics service
  return event;
}

// Example 3: Generate sales report
function generateSalesReport() {
  const orders = window.app.getOrders().getOrders();
  const transactions = window.app.getWallet().getTransactions(Infinity);
  
  const report = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    totalTransactions: transactions.length,
    generatedAt: new Date().toISOString()
  };
  
  return report;
}

// Example 4: Validate before checkout
function safeCheckout(productName, price) {
  try {
    FormValidator.validateRequired(productName, 'Product name');
    const amount = FormValidator.validateAmount(price);
    
    if (!window.app.getWallet().hasSufficientBalance(amount)) {
      throw new Error('Insufficient balance');
    }
    
    window.app.checkout.showCheckout(productName, amount);
  } catch (error) {
    window.app.notifications.error(error.message);
  }
}


// ============================================
// 13. TESTING HELPERS
// ============================================

// Create test data
function createTestData() {
  // Add test transactions
  window.app.getWallet().topUp(10000);
  
  // Create test orders
  window.app.getOrders().createOrder('Test Product 1', 2000);
  window.app.getOrders().createOrder('Test Product 2', 3000);
  window.app.getOrders().createOrder('Test Product 3', 1500);
  
  console.log('Test data created');
}

// Generate random purchase
function generateRandomPurchase() {
  const products = [
    { name: 'Starter Logs', price: 1500 },
    { name: 'Premium Logs', price: 3000 },
    { name: 'Bulk Logs', price: 5500 }
  ];
  
  const product = products[Math.floor(Math.random() * products.length)];
  
  try {
    window.app.checkout.processPurchase(product.name, product.price);
    console.log(`Random purchase: ${product.name}`);
  } catch (error) {
    console.error(error.message);
  }
}

// Stress test (add multiple orders)
function stressTest(count = 100) {
  for (let i = 0; i < count; i++) {
    generateRandomPurchase();
  }
  console.log(`Stress test: ${count} orders created`);
}


// ============================================
// 14. UTILITY FUNCTIONS
// ============================================

// Get user summary
function getUserSummary() {
  const wallet = window.app.getWallet();
  const orders = window.app.getOrders();
  
  return {
    balance: wallet.getBalance(),
    totalSpent: orders.getOrders().reduce((sum, o) => sum + o.total, 0),
    totalOrders: orders.getOrders().length,
    pendingOrders: orders.getPendingOrders().length,
    lastTransaction: wallet.getTransactions(1)[0],
    lastOrder: orders.getRecentOrders(1)[0]
  };
}

// Format order for display
function formatOrder(order) {
  return `
    Order #${order.id}
    Product: ${order.productName}
    Amount: ₦${order.total.toLocaleString('en-NG')}
    Status: ${order.status}
    Date: ${new Date(order.createdAt).toLocaleDateString()}
  `;
}

// Calculate remaining to next purchase
function remainingForPurchase(targetPrice) {
  const balance = window.app.getWallet().getBalance();
  const remaining = targetPrice - balance;
  return remaining > 0 ? remaining : 0;
}


// ============================================
// 15. CONFIGURATION & SETUP
// ============================================

// Change wallet initial balance
// window.app.wallet.balance = 50000;
// window.app.wallet.save();

// Add custom product listener
window.app.getOrders().subscribe((orders) => {
  // Track every order creation
  const lastOrder = orders[orders.length - 1];
  if (lastOrder) {
    console.log(`New order received: ${lastOrder.productName}`);
  }
});

// Set up global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  window.app.notifications.error('An error occurred. Please try again.');
});

// Monitor localStorage changes
window.addEventListener('storage', (event) => {
  if (event.key === 'easysocial-wallet-balance') {
    console.log('Wallet updated from another tab:', event.newValue);
  }
});
