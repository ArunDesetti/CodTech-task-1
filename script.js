// Cart state management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage
const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Product data generation
const generateProducts = (count) => {
    const categories = ["Kitchen", "Bathroom", "Living Room", "Bedroom", "Garden"];
    const products = [];
    
    for (let i = 1; i <= count; i++) {
        products.push({
            id: i,
            title: `Eco-Friendly Product ${i}`,
            price: Math.floor(Math.random() * (10000 - 1000) + 1000),
            image: `https://picsum.photos/seed/${i}/400/400`,
            category: categories[Math.floor(Math.random() * categories.length)],
            impact: {
                plastic: Number((Math.random() * 5).toFixed(1)),
                water: Math.floor(Math.random() * 1000),
            }
        });
    }
    return products;
};

// Format price in Indian Rupees
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

// Global variables
const PRODUCTS = generateProducts(50);
const ITEMS_PER_PAGE = 9;
let currentPage = 1;

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const paginationContainer = document.getElementById('pagination');
const toast = document.getElementById('toast');
const menuBtn = document.querySelector('.menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const cartBtns = document.querySelectorAll('.cart-btn, .cart-btn-mobile');

// Cart functionality
const updateCartCount = () => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartBtns.forEach(btn => {
        const countBadge = btn.querySelector('.cart-count') || document.createElement('span');
        countBadge.className = 'cart-count';
        countBadge.textContent = count || '';
        if (!btn.querySelector('.cart-count')) {
            btn.appendChild(countBadge);
        }
    });
};

// Toggle mobile menu
menuBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('show');
});

// Show toast notification
const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// Create product card
const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.title}">
            <span class="product-category">${product.category}</span>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">${formatPrice(product.price)}</p>
            <div class="product-impact">
                <div class="impact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22h10"/><path d="M12 6v8"/><path d="M8 14h8"/><path d="M2 2h20v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V2Z"/></svg>
                    ${product.impact.plastic}kg plastic saved
                </div>
                <div class="impact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a8 8 0 0 0 8-8c0-5-8-13-8-13S4 9 4 14a8 8 0 0 0 8 8Z"/></svg>
                    ${product.impact.water}L water saved
                </div>
            </div>
            <button class="product-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `;
    return card;
};

// Add to cart function
const addToCart = (productId) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.title} added to cart`);
};

// Cart modal
const createCartModal = () => {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <h2>Shopping Cart</h2>
            <div class="cart-items"></div>
            <div class="cart-total">
                <span>Total:</span>
                <span class="total-amount"></span>
            </div>
            <button class="checkout-btn" onclick="startCheckout()">Checkout</button>
            <button class="close-modal-btn" onclick="closeCartModal()">×</button>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
};

// Show cart modal
const showCartModal = () => {
    const modal = document.querySelector('.cart-modal') || createCartModal();
    const cartItems = modal.querySelector('.cart-items');
    const totalAmount = modal.querySelector('.total-amount');

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <h3>${item.title}</h3>
                <p>${formatPrice(item.price)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = formatPrice(total);

    modal.style.display = 'flex';
};

// Close cart modal
const closeCartModal = () => {
    const modal = document.querySelector('.cart-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Update quantity
const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        showCartModal(); // Refresh cart display
    }
};

// Remove from cart
const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    showCartModal(); // Refresh cart display
};

// Start checkout process
const startCheckout = () => {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'checkout-modal';
    checkoutModal.innerHTML = `
        <div class="checkout-modal-content">
            <h2>Checkout</h2>
            <form id="checkoutForm" onsubmit="processCheckout(event)">
                <div class="form-section">
                    <h3>Shipping Address</h3>
                    <input type="text" name="fullName" placeholder="Full Name" required>
                    <input type="text" name="address" placeholder="Address" required>
                    <input type="text" name="city" placeholder="City" required>
                    <input type="text" name="postalCode" placeholder="Postal Code" required>
                    <input type="tel" name="phone" placeholder="Phone Number" required>
                </div>
                <div class="form-section">
                    <h3>Payment Details</h3>
                    <input type="text" name="cardNumber" placeholder="Card Number" required>
                    <div class="card-details">
                        <input type="text" name="expiry" placeholder="MM/YY" required>
                        <input type="text" name="cvv" placeholder="CVV" required>
                    </div>
                </div>
                <button type="submit" class="checkout-submit-btn">Place Order</button>
            </form>
            <button class="close-modal-btn" onclick="closeCheckoutModal()">×</button>
        </div>
    `;
    document.body.appendChild(checkoutModal);
};

// Close checkout modal
const closeCheckoutModal = () => {
    const modal = document.querySelector('.checkout-modal');
    if (modal) {
        modal.remove();
    }
};

// Process checkout
const processCheckout = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const orderData = Object.fromEntries(formData.entries());
    
    // Simulate order processing
    setTimeout(() => {
        showToast('Order placed successfully!');
        cart = [];
        saveCart();
        updateCartCount();
        closeCheckoutModal();
        closeCartModal();
    }, 1500);
};

// Render products for current page
const renderProducts = () => {
    productsGrid.innerHTML = '';
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProducts = PRODUCTS.slice(startIndex, endIndex);
    
    currentProducts.forEach(product => {
        productsGrid.appendChild(createProductCard(product));
    });
};

// Create pagination
const createPagination = () => {
    const totalPages = Math.ceil(PRODUCTS.length / ITEMS_PER_PAGE);
    paginationContainer.innerHTML = '';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = 'Previous';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
            createPagination();
            window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: 'smooth' });
        }
    };
    paginationContainer.appendChild(prevBtn);
    
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderProducts();
            createPagination();
            window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: 'smooth' });
        };
        paginationContainer.appendChild(pageBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = 'Next';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
            createPagination();
            window.scrollTo({ top: productsGrid.offsetTop - 100, behavior: 'smooth' });
        }
    };
    paginationContainer.appendChild(nextBtn);
};

// Initialize cart buttons
cartBtns.forEach(btn => {
    btn.addEventListener('click', showCartModal);
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    createPagination();
    updateCartCount();
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const cartModal = document.querySelector('.cart-modal');
    const checkoutModal = document.querySelector('.checkout-modal');
    
    if (event.target === cartModal) {
        closeCartModal();
    }
    if (event.target === checkoutModal) {
        closeCheckoutModal();
    }
});