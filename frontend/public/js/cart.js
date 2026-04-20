// Cart Management
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.updateTotal();
    }

    addItem(product, quantity = 1) {
        if (!isLoggedIn()) {
            alert('Please register or login to add items to your cart.');
            window.location.href = 'login.html';
            return;
        }
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.save();
        this.updateTotal();
        this.updateUI();
    }

    removeItem(productId) {
        if (!isLoggedIn()) {
            alert('Please login to modify your cart.');
            window.location.href = 'login.html';
            return;
        }
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateTotal();
        this.updateUI();
    }

    updateQuantity(productId, quantity) {
        if (!isLoggedIn()) {
            alert('Please login to modify your cart.');
            window.location.href = 'login.html';
            return;
        }
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.save();
            this.updateTotal();
            this.updateUI();
        }
    }

    updateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    clear() {
        this.items = [];
        this.total = 0;
        localStorage.removeItem('cart');
        this.updateUI();
    }

    updateUI() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
        }

        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            cartTotal.textContent = `$${this.total.toFixed(2)}`;
        }

        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>$${item.price} x ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button onclick="cart.removeItem('${item.id}')" class="remove-btn">Remove</button>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Initialize cart
const cart = new Cart();

// Add cart icon and counter to navbar
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar-links');
    const cartLink = document.createElement('a');
    cartLink.href = '#';
    cartLink.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <span id="cart-count">0</span>
    `;
    cartLink.onclick = showCart;
    navbar.appendChild(cartLink);
    cart.updateUI();
});

// Cart modal
function showCart() {
    const modal = document.createElement('div');
// Removed modal and section2/ripple/cursor-dot/cursor-ripple/spotlight/grid-img/in-section2 logic
}

// Checkout function
function proceedToCheckout() {
    if (!isLoggedIn()) {
        showLoginModal();
        return;
    }
    showOrderForm();
}

// Order form
function showOrderForm() {
    const modal = document.createElement('div');
// Removed modal and section2/ripple/cursor-dot/cursor-ripple/spotlight/grid-img/in-section2 logic
}

// Order submission
async function submitOrder(e) {
    e.preventDefault();
    const formData = {
        items: cart.items,
        customerName: document.getElementById('name').value,
        contactNumber: document.getElementById('contact').value,
        deliveryAddress: document.getElementById('address').value,
        specialMessage: document.getElementById('message').value,
        total: cart.total
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Order placed successfully!');
            cart.clear();
            document.querySelector('.modal').remove();
        } else {
            throw new Error('Failed to place order');
        }
    } catch (error) {
        alert('Error placing order: ' + error.message);
    }
}

// Auth check
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Login modal
function showLoginModal() {
    const modal = document.createElement('div');
// Removed modal and section2/ripple/cursor-dot/cursor-ripple/spotlight/grid-img/in-section2 logic
}
