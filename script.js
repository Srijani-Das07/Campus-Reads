//BOOK DATABASE

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

//GLOBAL STATE

let cart = [];
let filteredBooks = [...books];

const deliveryCharges = { standard: 0, express: 100 };

//DOM REFERENCES

const bookGrid = document.getElementById("bookGrid");
const tableBody = document.getElementById("tableBody");
const bookSelect = document.getElementById("bookSelect");

const cartSidebar = document.getElementById("cartSidebar");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");
const tableCategoryFilter = document.getElementById("tableCategoryFilter");

//INITIAL LOAD

window.onload = () => {
  renderBooks(books);
  renderTable(books);
  populateBookDropdown();
};

//BOOK DISPLAY

function renderBooks(list) {
    // Clear the existing grid content
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

        let availabilityText = "";
        if (book.stock > 0) {
            availabilityText = "In Stock";
        } else {
            availabilityText = "Out of Stock";
        }

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


//SEARCH, FILTER, SORT

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

//CART FUNCTIONS

function addToCart(id) {
  const book = books.find(b => b.id === id);
  const item = cart.find(i => i.id === id);

  if (item) {
    if (item.qty < book.stock) item.qty++;
    else return alert("Stock limit reached");
  } else {
    cart.push({ id, title: book.title, price: book.price, qty: 1 });
  }
  updateCart();
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
    
    if (cart.length === 0) {
        summaryDiv.innerHTML = `<p style="color:red;">No books selected. Add books from the collection above.</p>`;
    } else {
        summaryDiv.innerHTML = cart.map(item => `
            <div class="summary-item-row" style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #eee; padding:5px 0;">
                <span>${item.title} (x${item.qty})</span>
                <span>₹${item.price * item.qty}</span>
            </div>
        `).join("");
    }
    updateOrderPrice(); 
}

function changeQty(i, d) {
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

function toggleCart() {
  cartSidebar.classList.toggle("active");
}

function proceedToCheckout() {
  if (cart.length === 0) return alert("Cart is empty!");
  toggleCart();
  document.getElementById("order").scrollIntoView({ behavior: "smooth" });
}

//ORDER PRICE CALCULATION

function updateOrderPrice() {
    const delivery = document.querySelector('input[name="delivery"]:checked')?.value || "standard";
    
    // Calculate total from cart array
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const deliveryFee = deliveryCharges[delivery];

    document.getElementById("summaryQuantity").textContent = totalQty;
    document.getElementById("subtotal").textContent = subtotal;
    document.getElementById("deliveryCharge").textContent = deliveryFee;
    document.getElementById("totalAmount").textContent = subtotal + deliveryFee;
}

document.getElementById("orderForm").onsubmit = function(e) {
    e.preventDefault();
    if(cart.length === 0) {
        alert("Please add at least one book to your cart before ordering.");
        return;
    }
    
    const orderDetails = {
        customer: document.getElementById("fullName").value,
        items: cart,
        total: document.getElementById("totalAmount").textContent
    };

    console.log("Order Placed:", orderDetails);
    alert(`Thank you, ${orderDetails.customer}! Your order for ${cart.length} different book types has been received.`);
    
    clearCart();
    this.reset();
};