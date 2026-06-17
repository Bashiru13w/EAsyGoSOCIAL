/**
 * EASYgoSocial - Main Application Module
 * Handles wallet management, transactions, and user interactions
 */

class WalletManager {
  constructor(storageKey = 'easysocial-wallet-balance', initialBalance = 8000) {
    this.storageKey = storageKey;
    this.balance = Number(localStorage.getItem(storageKey) || initialBalance);
    this.transactions = this.loadTransactions();
    this.listeners = [];
  }

  /**
   * Format currency to Nigerian Naira
   */
  static formatNGN(value) {
    if (!Number.isFinite(value)) return '₦0';
    return `₦${Math.floor(value).toLocaleString('en-NG')}`;
  }

  /**
   * Save wallet balance to localStorage
   */
  save() {
    localStorage.setItem(this.storageKey, String(this.balance));
    this.notifyListeners();
  }

  /**
   * Load transaction history
   */
  loadTransactions() {
    try {
      const data = localStorage.getItem('easysocial-transactions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  }

  /**
   * Save transaction to history
   */
  saveTransactions() {
    try {
      localStorage.setItem('easysocial-transactions', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }

  /**
   * Add a transaction
   */
  addTransaction(type, amount, description, status = 'completed') {
    const transaction = {
      id: Date.now(),
      type, // 'credit', 'debit'
      amount,
      description,
      status,
      timestamp: new Date().toISOString(),
    };
    this.transactions.push(transaction);
    this.saveTransactions();
    return transaction;
  }

  /**
   * Get transaction history
   */
  getTransactions(limit = 10) {
    return this.transactions.slice(-limit).reverse();
  }

  /**
   * Top up wallet
   */
  topUp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid amount. Please enter a positive number.');
    }
    this.balance += amount;
    this.addTransaction('credit', amount, 'Wallet Top Up', 'completed');
    this.save();
    return this.balance;
  }

  /**
   * Deduct from wallet
   */
  deduct(amount, description) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid amount. Please enter a positive number.');
    }
    if (this.balance < amount) {
      throw new Error(`Insufficient balance. You need ${WalletManager.formatNGN(amount - this.balance)} more.`);
    }
    this.balance -= amount;
    this.addTransaction('debit', amount, description, 'completed');
    this.save();
    return this.balance;
  }

  /**
   * Check if balance is sufficient
   */
  hasSufficientBalance(amount) {
    return this.balance >= amount;
  }

  /**
   * Subscribe to wallet changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.balance));
  }

  /**
   * Get current balance
   */
  getBalance() {
    return this.balance;
  }
}

class OrderManager {
  constructor() {
    this.orders = this.loadOrders();
    this.listeners = [];
  }

  /**
   * Load orders from localStorage
   */
  loadOrders() {
    try {
      const data = localStorage.getItem('easysocial-orders');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load orders:', error);
      return [];
    }
  }

  /**
   * Save orders to localStorage
   */
  saveOrders() {
    try {
      localStorage.setItem('easysocial-orders', JSON.stringify(this.orders));
    } catch (error) {
      console.error('Failed to save orders:', error);
    }
  }

  /**
   * Create new order
   */
  createOrder(productName, price, quantity = 1) {
    const order = {
      id: Date.now(),
      productName,
      price,
      quantity,
      total: price * quantity,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveredAt: null,
    };
    this.orders.push(order);
    this.saveOrders();
    this.notifyListeners();
    return order;
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId, status) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (status === 'delivered') {
        order.deliveredAt = new Date().toISOString();
      }
      this.saveOrders();
      this.notifyListeners();
    }
    return order;
  }

  /**
   * Get all orders
   */
  getOrders() {
    return this.orders;
  }

  /**
   * Get recent orders
   */
  getRecentOrders(limit = 10) {
    return this.orders.slice(-limit).reverse();
  }

  /**
   * Get pending orders
   */
  getPendingOrders() {
    return this.orders.filter(o => o.status === 'pending');
  }

  /**
   * Subscribe to order changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.orders));
  }
}

class NotificationManager {
  constructor(containerSelector = '#checkoutMessage') {
    this.container = document.querySelector(containerSelector);
    this.timeout = null;
  }

  /**
   * Show notification
   */
  show(message, type = 'success', duration = 5000) {
    if (!this.container) {
      console.warn('Notification container not found');
      return;
    }

    this.container.className = `checkout-message ${type}`;
    this.container.textContent = message;
    this.container.style.display = 'block';

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.container.style.display = 'none';
    }, duration);
  }

  /**
   * Show success message
   */
  success(message, duration = 5000) {
    this.show(message, 'success', duration);
  }

  /**
   * Show error message
   */
  error(message, duration = 5000) {
    this.show(message, 'error', duration);
  }

  /**
   * Show warning message
   */
  warning(message, duration = 5000) {
    this.show(message, 'warning', duration);
  }

  /**
   * Show info message
   */
  info(message, duration = 5000) {
    this.show(message, 'info', duration);
  }
}

class ModalManager {
  constructor(modalSelector = '#checkoutModal') {
    this.modal = document.querySelector(modalSelector);
    this.closeBtn = this.modal?.querySelector('.modal-close');
    this.titleEl = this.modal?.querySelector('#modalTitle');
    this.textEl = this.modal?.querySelector('#modalText');
    this.confirmBtn = this.modal?.querySelector('#confirmCheckout');
    this.callbacks = {};

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }
  }

  /**
   * Open modal with custom content
   */
  open(title, message, onConfirm, confirmText = 'Confirm') {
    if (!this.modal) return;

    if (this.titleEl) this.titleEl.textContent = title;
    if (this.textEl) this.textEl.textContent = message;

    if (this.confirmBtn) {
      this.confirmBtn.textContent = confirmText;
      this.callbacks.confirm = onConfirm;
    }

    this.modal.classList.add('show');
  }

  /**
   * Close modal
   */
  close() {
    if (this.modal) {
      this.modal.classList.remove('show');
    }
  }

  /**
   * Setup confirm handler
   */
  onConfirm(callback) {
    if (this.confirmBtn) {
      this.confirmBtn.removeEventListener('click', this.confirmHandler);
      this.confirmHandler = () => {
        callback();
        this.close();
      };
      this.confirmBtn.addEventListener('click', this.confirmHandler);
    }
  }
}

class CheckoutManager {
  constructor(walletManager, orderManager, notificationManager, modalManager) {
    this.wallet = walletManager;
    this.orders = orderManager;
    this.notifications = notificationManager;
    this.modal = modalManager;
    this.sellerAlertEl = document.getElementById('sellerAlert');
  }

  /**
   * Process purchase
   */
  processPurchase(productName, price, quantity = 1) {
    try {
      if (!this.wallet.hasSufficientBalance(price)) {
        const needed = WalletManager.formatNGN(price - this.wallet.getBalance());
        throw new Error(`Insufficient balance. You need ${needed} more.`);
      }

      // Deduct from wallet
      this.wallet.deduct(price, `Purchase: ${productName}`);

      // Create order
      const order = this.orders.createOrder(productName, price, quantity);

      // Update seller alert
      this.updateSellerAlert(productName, order.id);

      // Show success notification
      this.notifications.success(
        `✓ Purchase successful! ${productName} was bought. Seller notified to deliver now.`
      );

      return order;
    } catch (error) {
      this.notifications.error(error.message);
      throw error;
    }
  }

  /**
   * Update seller alert
   */
  updateSellerAlert(productName, orderId) {
    if (this.sellerAlertEl) {
      const timestamp = new Date().toLocaleTimeString();
      this.sellerAlertEl.innerHTML = `
        <strong>🔔 New Order #${orderId}</strong><br>
        ${productName} purchased at ${timestamp}<br>
        <small>Click to view details</small>
      `;
    }
  }

  /**
   * Show checkout confirmation
   */
  showCheckout(productName, price) {
    const message = `This will deduct ${WalletManager.formatNGN(price)} from your wallet balance of ${WalletManager.formatNGN(this.wallet.getBalance())}.`;

    this.modal.open(
      `Buy ${productName}`,
      message,
      () => this.processPurchase(productName, price),
      'Confirm Purchase'
    );
  }
}

class FormValidator {
  /**
   * Validate email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.length >= 7 && phoneRegex.test(phone);
  }

  /**
   * Validate required fields
   */
  static validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
      throw new Error(`${fieldName} is required.`);
    }
  }

  /**
   * Validate amount
   */
  static validateAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Please enter a valid amount.');
    }
    return amount;
  }
}

class UIManager {
  constructor() {
    this.walletBalanceEl = document.getElementById('walletBalance');
    this.topUpBtn = document.getElementById('topUpBtn');
    this.topUpAmountEl = document.getElementById('topUpAmount');
    this.buyButtons = document.querySelectorAll('.buy-btn');
    this.orderForm = document.getElementById('orderForm');
  }

  /**
   * Update wallet display
   */
  updateWalletDisplay(balance) {
    if (this.walletBalanceEl) {
      this.walletBalanceEl.textContent = WalletManager.formatNGN(balance);
    }
  }

  /**
   * Setup buy button listeners
   */
  setupBuyButtons(callback) {
    this.buyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        callback(name, price);
      });
    });
  }

  /**
   * Setup top-up button
   */
  setupTopUpButton(callback) {
    if (this.topUpBtn) {
      this.topUpBtn.addEventListener('click', () => {
        try {
          const amount = FormValidator.validateAmount(this.topUpAmountEl.value);
          callback(amount);
          this.topUpAmountEl.value = '1000'; // Reset input
        } catch (error) {
          throw error;
        }
      });
    }
  }

  /**
   * Setup order form
   */
  setupOrderForm(callback) {
    if (this.orderForm) {
      this.orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        callback(this.orderForm);
      });
    }
  }

  /**
   * Clear order form
   */
  clearOrderForm() {
    if (this.orderForm) {
      this.orderForm.reset();
    }
  }
}

/**
 * Application Initialization
 */
class App {
  constructor() {
    this.wallet = new WalletManager();
    this.orders = new OrderManager();
    this.notifications = new NotificationManager();
    this.modal = new ModalManager();
    this.checkout = new CheckoutManager(this.wallet, this.orders, this.notifications, this.modal);
    this.ui = new UIManager();
  }

  /**
   * Initialize the application
   */
  init() {
    try {
      // Update initial wallet display
      this.ui.updateWalletDisplay(this.wallet.getBalance());

      // Subscribe to wallet changes
      this.wallet.subscribe((balance) => {
        this.ui.updateWalletDisplay(balance);
      });

      // Setup buy buttons
      this.ui.setupBuyButtons((name, price) => {
        this.checkout.showCheckout(name, price);
      });

      // Setup top-up button
      this.ui.setupTopUpButton((amount) => {
        try {
          this.wallet.topUp(amount);
          this.notifications.success(`Wallet topped up with ${WalletManager.formatNGN(amount)}.`);
        } catch (error) {
          this.notifications.error(error.message);
        }
      });

      // Setup order form
      this.ui.setupOrderForm((form) => {
        this.handleOrderSubmit(form);
      });

      console.log('✓ App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.notifications.error('Failed to initialize application.');
    }
  }

  /**
   * Handle order form submission
   */
  handleOrderSubmit(form) {
    try {
      const name = form.querySelector('#name').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const product = form.querySelector('#product').value;
      const quantity = form.querySelector('#quantity').value;
      const notes = form.querySelector('#notes').value.trim();

      // Validate inputs
      FormValidator.validateRequired(name, 'Name');
      FormValidator.validateRequired(phone, 'Phone');
      FormValidator.validateRequired(product, 'Product');

      if (!FormValidator.isValidPhone(phone)) {
        throw new Error('Please enter a valid phone number.');
      }

      // Build WhatsApp message
      const message = `Hello EASYgoSocial,\n\nI want to place an order:\n\n📝 Details:\nName: ${name}\n📞 Phone: ${phone}\n🛍️ Product: ${product}\n📦 Quantity: ${quantity}\n📋 Notes: ${notes || 'No additional notes'}\n\nPlease confirm availability and delivery timeline.\n\nThank you!`;

      // Get WhatsApp number from link or use default
      const whatsappLink = document.querySelector('a[href*="wa.me"]');
      const whatsappNumber = whatsappLink ? whatsappLink.href.split('/').pop() : 'yourphonenumber';

      // Open WhatsApp
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      // Clear form
      this.ui.clearOrderForm();
      this.notifications.success('Order sent to WhatsApp! Please check your phone.');
    } catch (error) {
      this.notifications.error(error.message);
    }
  }

  /**
   * Get wallet manager (for external access)
   */
  getWallet() {
    return this.wallet;
  }

  /**
   * Get orders manager (for external access)
   */
  getOrders() {
    return this.orders;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
  });
} else {
  window.app = new App();
  window.app.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    App,
    WalletManager,
    OrderManager,
    NotificationManager,
    ModalManager,
    CheckoutManager,
    FormValidator,
    UIManager,
  };
}
