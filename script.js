// ==================== AUTHENTICATION & LOGOUT ====================

const currentUser = getSession();
if (!currentUser) {
    window.location.href = 'index.html';
}

function logout() {
    clearSession();
    window.location.href = 'index.html';
}

window.addEventListener('DOMContentLoaded', async function() {
    const banner = document.getElementById('userBanner');
    const bannerName = document.getElementById('bannerUserName');
    
    if (banner && bannerName && currentUser) {
        bannerName.textContent = currentUser.name || currentUser.email;
        banner.style.display = 'block';
    }
    
    // Pre-fill order form
    const nameField = document.getElementById('fullName');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    if (nameField) nameField.value = currentUser?.name || '';
    if (emailField) emailField.value = currentUser?.email || '';
    if (phoneField) phoneField.value = currentUser?.phone || '';

    // Restore cart from IndexedDB
    try {
        cart = await loadCart(currentUser.email);
        updateCart();
    } catch (e) {
        cart = [];
    }
});

// ==================== BOOK DATABASE ====================

const books = [
  { id: 1, title: "Let Us C", author: "Yashavant Kanetkar", category: "Programming", price: 350, stock: 15, image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1599648837i/55281145.jpg" },
  { id: 2, title: "Dracula", author: "Bram Stoker", category: "Classic", price: 500, stock: 8, image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1387151694i/17245.jpg" },
  { id: 3, title: "Harry Potter", author: "J.K. Rowling", category: "Fantasy", price: 499, stock: 12, image: "https://m.media-amazon.com/images/I/81q77Q39nEL._AC_UF1000,1000_QL80_.jpg" },
  { id: 4, title: "Sherlock Holmes", author: "Arthur Conan Doyle", category: "Detective", price: 650, stock: 6, image: "https://m.media-amazon.com/images/I/81tNnqcHxlL._AC_UF1000,1000_QL80_.jpg" },
  { id: 5, title: "And Then There Were None", author: "Agatha Christie", category: "Thriller", price: 549, stock: 10, image: "https://m.media-amazon.com/images/I/81nChcVy7CL._AC_UF1000,1000_QL80_.jpg" },
  { id: 6, title: "Engineering Mathematics", author: "B.S. Grewal", category: "Academic", price: 420, stock: 20, image: "https://khannabooks.com/wp-content/uploads/2023/10/9789382609919.jpg.webp" },
  { id: 7, title: "Data Structures in C", author: "Reema Thareja", category: "Programming", price: 445, stock: 14, image: "https://india.oup.com/covers/pop-up/9789354977190" },
  { id: 8, title: "Hunger Games", author: "Suzanne Collins", category: "Fiction", price: 645, stock: 12, image: "https://m.media-amazon.com/images/I/61I24wOsn8L.jpg" },
  { id: 9, title: "GATE Computer Science", author: "D.P. Nagpal", category: "Competitive", price: 850, stock: 0, image: "https://www.schandpublishing.com/Handler/ImageHandler.ashx?width=314&height=404&imgpath=~/Upload/BookImage/9788121932110.jpg" },
  { id: 10, title: "The Magic Faraway Tree", author: "Enid Blyton", category: "Fantasy", price: 350, stock: 0, image: "https://m.media-amazon.com/images/I/71b2fzhsrgL._AC_UF1000,1000_QL80_.jpg" }
];

// ==================== GLOBAL STATE ====================

let cart = [];
let filteredBooks = [...books];
let lastOrder = null;

const deliveryCharges = { standard: 0, express: 100 };

// ==================== DOM REFERENCES ====================

const bookGrid = document.getElementById("bookGrid");
const tableBody = document.getElementById("tableBody");
const cartSidebar = document.getElementById("cartSidebar");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");
const tableCategoryFilter = document.getElementById("tableCategoryFilter");

// ==================== INITIAL LOAD ====================

window.onload = () => {
    renderBooks(books);
    renderTable(books);
};

// ==================== BOOK DISPLAY ====================

function renderBooks(list) {
    bookGrid.innerHTML = "";

    if (list.length === 0) {
        bookGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px">No books found</p>`;
        return;
    }

    for (let i = 0; i < list.length; i++) {
        let book = list[i];
        let stockStatus = "";
        let buttonHTML = "";

        if (book.stock > 0) {
            stockStatus = "<p class='availability in-stock'>✓ In Stock</p>";
            buttonHTML = "<button class='btn-add-to-cart' onclick='addToCart(" + book.id + ")'>Add to Cart</button>";
        } else {
            stockStatus = "<p class='availability out-of-stock'>❌ Out of Stock</p>";
            buttonHTML = "<button class='btn-add-to-cart' disabled>Out of Stock</button>";
        }

        bookGrid.innerHTML +=
            "<div class='book-card'>" +
                "<img src='" + book.image + "' alt='" + book.title + "'>" +
                "<h3>" + book.title + "</h3>" +
                "<p class='author'>by " + book.author + "</p>" +
                "<span class='category'>" + book.category + "</span>" +
                "<p class='price'>₹" + book.price + "</p>" +
                stockStatus +
                buttonHTML +
            "</div>";
    }
}

function renderTable(list) {
    tableBody.innerHTML = "";

    for (let j = 0; j < list.length; j++) {
        let book = list[j];
        let availabilityText = book.stock > 0 ? "In Stock" : "Out of Stock";

        let row = "<tr data-category='" + book.category + "'>" +
                    "<td>" + book.title + "</td>" +
                    "<td>" + book.author + "</td>" +
                    "<td>" + book.category + "</td>" +
                    "<td>₹" + book.price + "</td>" +
                    "<td>" + availabilityText + "</td>" +
                  "</tr>";

        tableBody.innerHTML += row;
    }
}

// ==================== SEARCH, FILTER, SORT ====================

function searchBooks() {
    const q = searchInput.value.toLowerCase();
    filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
    renderBooks(filteredBooks);
}

function filterBooks() {
    const cat = categoryFilter.value;
    const price = priceFilter.value;

    filteredBooks = books.filter(b => {
        if (cat !== "all" && b.category !== cat) return false;
        if (price === "0-300") return b.price < 300;
        if (price === "300-500") return b.price >= 300 && b.price <= 500;
        if (price === "500-800") return b.price > 500 && b.price <= 800;
        if (price === "800+") return b.price > 800;
        return true;
    });

    renderBooks(filteredBooks);
}

function sortBooks() {
    const type = sortFilter.value;
    const sorted = [...filteredBooks].sort((a, b) => {
        if (type === "price-low") return a.price - b.price;
        if (type === "price-high") return b.price - a.price;
        if (type === "name-az") return a.title.localeCompare(b.title);
        if (type === "name-za") return b.title.localeCompare(a.title);
        return 0;
    });
    renderBooks(sorted);
}

function filterTable() {
    const value = tableCategoryFilter.value;
    document.querySelectorAll("#tableBody tr").forEach(row => {
        row.style.display =
            value === "all" || row.dataset.category === value ? "" : "none";
    });
}

// ==================== CART FUNCTIONS ====================

function addToCart(id) {
    const book = books.find(b => b.id === id);
    const item = cart.find(i => i.id === id);

    if (item) {
        if (item.qty < book.stock) item.qty++;
        else { showToast("Stock limit reached!"); return; }
    } else {
        cart.push({ id, title: book.title, price: book.price, qty: 1 });
    }
    updateCart();
    persistCart();
    showToast('"' + book.title + '" added to cart!');
}

function updateCart() {
    cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
    cartTotal.textContent = cart.reduce((s, i) => s + i.qty * i.price, 0);

    cartItems.innerHTML = cart.length === 0
        ? "<p>Your cart is empty</p>"
        : cart.map((i, idx) => `
            <div class="cart-item">
                <strong>${i.title}</strong><br>
                ₹${i.price} × ${i.qty}
                <div>
                    <button onclick="changeQty(${idx},1)">+</button>
                    <button onclick="changeQty(${idx},-1)">−</button>
                    <button onclick="removeItem(${idx})">Remove</button>
                </div>
            </div>
        `).join("");

    renderOrderSummary();
}

function renderOrderSummary() {
    const summaryDiv = document.getElementById("orderItemsSummary");
    if (!summaryDiv) return;

    if (cart.length === 0) {
        summaryDiv.innerHTML = `<p style="color: #666; text-align: center; padding: 15px;">🛒 Your cart is empty. Add books from the collection above.</p>`;
    } else {
        summaryDiv.innerHTML = cart.map(item => `
            <div class="summary-item-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: var(--dark);">${item.title}</span>
                    <span style="font-size: 0.85em; color: var(--muted);">Qty: ${item.qty} × ₹${item.price}</span>
                </div>
                <span style="font-weight: 700; color: var(--primary);">₹${item.price * item.qty}</span>
            </div>
        `).join('');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        summaryDiv.innerHTML += `
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid var(--primary); font-weight: 700;">
                <span>Subtotal:</span>
                <span style="color: var(--primary);">₹${subtotal}</span>
            </div>
        `;
    }
    updateOrderPrice();
}

function changeQty(i, d) {
    cart[i].qty += d;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    updateCart();
    persistCart();
}

function removeItem(i) {
    cart.splice(i, 1);
    updateCart();
    persistCart();
}

function clearCart() {
    cart = [];
    updateCart();
    persistCart();
}

function toggleCart() {
    cartSidebar.classList.toggle("active");
}

function proceedToCheckout() {
    if (cart.length === 0) { showToast("Cart is empty!"); return; }
    toggleCart();
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
}

async function persistCart() {
    try { await saveCart(currentUser.email, cart); } catch (e) {}
}

// ==================== ORDER PRICE CALCULATION ====================

function updateOrderPrice() {
    const delivery = document.querySelector('input[name="delivery"]:checked')?.value || "standard";

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const deliveryFee = deliveryCharges[delivery];
    const packagingFee = 0;
    const gstRate = 0.05;
    const gstAmount = Math.round(subtotal * gstRate);

    let discountAmount = 0;
    const discountRow = document.getElementById('discountRow');
    const savingsMessage = document.getElementById('savingsMessage');
    const savingsAmount = document.getElementById('savingsAmount');

    if (subtotal > 1000) {
        discountAmount = Math.round(subtotal * 0.1);
        discountRow.style.display = 'flex';
        document.getElementById('discountAmount').textContent = discountAmount;
        savingsMessage.style.display = 'block';
        savingsAmount.textContent = discountAmount;
    } else {
        discountRow.style.display = 'none';
        savingsMessage.style.display = 'none';
    }

    const grandTotal = subtotal + deliveryFee + packagingFee + gstAmount - discountAmount;

    document.getElementById('totalItemsCount').textContent = totalQty;
    document.getElementById('subtotal').textContent = subtotal;
    document.getElementById('deliveryCharge').textContent = deliveryFee;
    document.getElementById('packagingCharge').textContent = packagingFee;
    document.getElementById('gstCharge').textContent = gstAmount;
    document.getElementById('totalAmount').textContent = grandTotal;

    renderPriceBreakdown();
}

function renderPriceBreakdown() {
    const breakdownDiv = document.getElementById('priceBreakdown');
    if (!breakdownDiv) return;

    if (cart.length === 0) {
        breakdownDiv.innerHTML = '<p style="color: #666; text-align: center; padding: 10px;">No items in cart</p>';
        return;
    }

    breakdownDiv.innerHTML = cart.map(item => `
        <div class="breakdown-item">
            <span>
                <span class="book-title">${item.title}</span>
                <span class="book-quantity">x${item.qty}</span>
            </span>
            <span class="book-price">₹${item.price * item.qty}</span>
        </div>
    `).join('');
}

// ==================== ORDER SUBMIT — opens payment modal ====================

function handleOrderSubmit(e) {
    e.preventDefault();
    if (cart.length === 0) {
        showToast("Please add at least one book to your cart before ordering.");
        return;
    }
    const payment = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
    const grandTotal = parseInt(document.getElementById('totalAmount').textContent) || 0;
    openPaymentModal(payment, grandTotal);
}

// ==================== PAYMENT MODAL ====================

function openPaymentModal(method, amount) {
    document.getElementById('paymentModal').style.display = 'flex';
    ['upiScreen', 'cardScreen', 'codScreen'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });

    if (method === 'upi') {
        document.getElementById('upiScreen').style.display = 'block';
        document.getElementById('upiAmount').textContent = amount;
        document.getElementById('upiLoader').style.display = 'none';
    } else if (method === 'card') {
        document.getElementById('cardScreen').style.display = 'block';
        document.getElementById('cardAmount').textContent = amount;
        document.getElementById('cardPayAmount').textContent = amount;
        document.getElementById('cardLoader').style.display = 'none';
        document.getElementById('cardPayBtn').disabled = false;
    } else {
        document.getElementById('codScreen').style.display = 'block';
        document.getElementById('codAmount').textContent = amount;
    }
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// ---- UPI ----

function simulateUPIApp(app) {
    const loader = document.getElementById('upiLoader');
    loader.style.display = 'flex';
    document.getElementById('upiLoaderText').textContent = 'Opening ' + app + '… (mock simulation)';
    setTimeout(() => {
        document.getElementById('upiLoaderText').textContent = 'Waiting for payment confirmation…';
    }, 1500);
}

function copyUPIId() {
    navigator.clipboard?.writeText('campusreads@okaxis').catch(() => {});
    showToast('UPI ID copied!');
}

function confirmUPIPayment() {
    closePaymentModal();
    finalizeOrder('UPI Payment');
}

// ---- Card ----

function formatCardNumber(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
    const masked = (v + '................').slice(0, 16)
        .replace(/(.{4})/g, '$1 ').trim()
        .replace(/\d(?=\d{4})/g, '•');
    document.getElementById('cardNumDisplay').textContent = masked || '•••• •••• •••• ••••';
}

function formatExpiry(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    input.value = v;
    document.getElementById('cardExpDisplay').textContent = v || 'MM/YY';
}

function updateCardPreview() {
    const name = document.getElementById('cardName').value.toUpperCase() || 'YOUR NAME';
    document.getElementById('cardNameDisplay').textContent = name;
}

function processCardPayment() {
    const num = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const name = document.getElementById('cardName').value;
    const expiry = document.getElementById('cardExpiry').value;
    const cvv = document.getElementById('cardCVV').value;

    if (num.length < 16) return showToast('Enter a valid 16-digit card number');
    if (!name.trim()) return showToast('Enter the cardholder name');
    if (expiry.length < 5) return showToast('Enter expiry in MM/YY format');
    if (cvv.length < 3) return showToast('Enter a 3-digit CVV');

    const loader = document.getElementById('cardLoader');
    const btn = document.getElementById('cardPayBtn');
    loader.style.display = 'flex';
    btn.disabled = true;

    const steps = [
        'Connecting to bank…',
        'Verifying card…',
        'Authorising payment…',
        'Payment confirmed! ✓'
    ];
    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            document.getElementById('cardLoaderText').textContent = steps[i++];
        } else {
            clearInterval(interval);
            const cardType = num.startsWith('4') ? 'Visa' : num.startsWith('5') ? 'Mastercard' : 'Card';
            closePaymentModal();
            finalizeOrder('Card (' + cardType + ' ····' + num.slice(-4) + ')');
        }
    }, 750);
}

// ---- COD ----

function confirmCODPayment() {
    closePaymentModal();
    finalizeOrder('Cash on Delivery');
}

// ==================== FINALIZE ORDER ====================

async function finalizeOrder(paymentMethod) {
    const orderId = 'CR' + Date.now().toString().slice(-8);
    const delivery = document.querySelector('input[name="delivery"]:checked')?.value || 'standard';
    const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const deliveryFee = deliveryCharges[delivery];
    const gst = Math.round(subtotal * 0.05);
    const discount = subtotal > 1000 ? Math.round(subtotal * 0.1) : 0;
    const grandTotal = subtotal + deliveryFee + gst - discount;

    const order = {
        orderId,
        userEmail: currentUser.email,
        userName: document.getElementById('fullName').value,
        userPhone: document.getElementById('phone').value,
        userAddress: document.getElementById('address').value,
        items: [...cart],
        delivery,
        deliveryFee,
        subtotal,
        gst,
        discount,
        grandTotal,
        paymentMethod,
        status: paymentMethod === 'Cash on Delivery' ? 'Pending Payment' : 'Paid',
        createdAt: new Date().toISOString()
    };

    try { await saveOrder(order); } catch (e) { console.warn('Order save error:', e); }

    lastOrder = order;

    // Clear cart
    cart = [];
    try { await clearCartDB(currentUser.email); } catch (e) {}
    updateCart();

    // Reset form but re-prefill user info
    document.getElementById('orderForm').reset();
    if (document.getElementById('fullName')) document.getElementById('fullName').value = currentUser.name || '';
    if (document.getElementById('email')) document.getElementById('email').value = currentUser.email || '';
    if (document.getElementById('phone')) document.getElementById('phone').value = currentUser.phone || '';

    // Show success modal
    document.getElementById('confirmOrderId').textContent = orderId;
    document.getElementById('successDetail').textContent =
        paymentMethod === 'Cash on Delivery'
            ? 'Keep ₹' + grandTotal + ' ready at delivery (5–7 days).'
            : '₹' + grandTotal + ' paid via ' + paymentMethod + '.';
    document.getElementById('successModal').style.display = 'flex';
}

// ==================== SUCCESS MODAL ====================

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== PDF RECEIPT ====================

function downloadReceipt() {
    if (!lastOrder) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    let y = 20;

    // Header bar — teal
    doc.setFillColor(97, 139, 142);
    doc.rect(0, 0, pageW, 42, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CampusReads', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Campus Bookstore · VIT Chennai', margin, 27);
    doc.text('support@campusreads.com · +91 9876543210', margin, 34);

    // Order ID box top-right
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageW - 72, 8, 54, 26, 2, 2, 'F');
    doc.setTextColor(97, 139, 142);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('ORDER RECEIPT', pageW - 69, 17);
    doc.setFont('helvetica', 'normal');
    doc.text(lastOrder.orderId, pageW - 69, 23);
    doc.text(new Date(lastOrder.createdAt).toLocaleDateString('en-IN'), pageW - 69, 29);

    y = 54;

    // Section title helper
    const section = (title) => {
        doc.setFillColor(240, 244, 241);
        doc.rect(margin, y, pageW - 2 * margin, 8, 'F');
        doc.setTextColor(44, 31, 46);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(title, margin + 3, y + 5.5);
        y += 12;
    };

    // Row helper
    const row = (label, value, bold) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(44, 31, 46);
        doc.text(String(label), margin + 3, y);
        doc.text(String(value), pageW - margin - 3, y, { align: 'right' });
        y += 7;
    };

    section('CUSTOMER DETAILS');
    row('Name', lastOrder.userName);
    row('Email', lastOrder.userEmail);
    row('Phone', lastOrder.userPhone);
    row('Address', lastOrder.userAddress.replace(/\n/g, ', '));
    y += 3;

    section('ORDER ITEMS');
    lastOrder.items.forEach(item => {
        row(item.title + '  ×' + item.qty, '₹' + (item.price * item.qty));
    });
    y += 3;

    section('BILL BREAKDOWN');
    row('Subtotal', '₹' + lastOrder.subtotal);
    row('Delivery (' + (lastOrder.delivery === 'express' ? 'Express' : 'Standard') + ')', '₹' + lastOrder.deliveryFee);
    row('GST (5%)', '₹' + lastOrder.gst);
    if (lastOrder.discount > 0) row('Student Discount (10%)', '−₹' + lastOrder.discount);

    // Divider line
    doc.setDrawColor(97, 139, 142);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
    row('GRAND TOTAL', '₹' + lastOrder.grandTotal, true);
    y += 3;

    section('PAYMENT DETAILS');
    row('Method', lastOrder.paymentMethod);
    row('Status', lastOrder.status);
    row('Date', new Date(lastOrder.createdAt).toLocaleString('en-IN'));
    y += 5;

    // Footer bar
    doc.setFillColor(44, 31, 46);
    doc.rect(0, 275, pageW, 22, 'F');
    doc.setTextColor(188, 196, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for shopping at CampusReads!', pageW / 2, 283, { align: 'center' });
    doc.text('Srijani Das · 24BCE1170 · © 2026 CampusReads', pageW / 2, 290, { align: 'center' });

    doc.save('CampusReads_Receipt_' + lastOrder.orderId + '.pdf');
}

// ==================== ORDER HISTORY ====================

async function showOrderHistory() {
    document.getElementById('historyModal').style.display = 'flex';
    const list = document.getElementById('orderHistoryList');
    list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:30px;">Loading orders…</p>';
    try {
        const orders = await getOrdersByUser(currentUser.email);
        if (orders.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:30px;">No orders yet. Go browse some books! 📚</p>';
            return;
        }
        list.innerHTML = orders.map(o => `
            <div class="history-card">
                <div class="history-card-header">
                    <span class="history-order-id">${o.orderId}</span>
                    <span class="history-status ${o.status === 'Paid' ? 'status-paid' : 'status-pending'}">${o.status}</span>
                </div>
                <div class="history-meta">
                    <span>📅 ${new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                    <span>💳 ${o.paymentMethod}</span>
                    <span>📦 ${o.delivery === 'express' ? 'Express' : 'Standard'} delivery</span>
                </div>
                <div class="history-items">${o.items.map(i => i.title + ' ×' + i.qty).join(', ')}</div>
                <div class="history-total">Grand Total: <strong>₹${o.grandTotal}</strong></div>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:30px;">Could not load order history.</p>';
    }
}

function closeOrderHistory() {
    document.getElementById('historyModal').style.display = 'none';
}

// ==================== TOAST ====================

function showToast(msg) {
    const toast = document.getElementById('toastEl');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}
