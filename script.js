// ==========================================
// VARIABLES - Book prices and delivery costs
// ==========================================

const bookPrices = {
    "350": { name: "Let Us C", price: 350 },
    "500": { name: "Dracula", price: 500 },
    "499": { name: "Harry Potter", price: 499 },
    "650": { name: "Sherlock Holmes", price: 650 },
    "549": { name: "And Then There Were None", price: 549 },
    "420": { name: "Engineering Mathematics", price: 420 }
};

const deliveryCharges = {
    standard: 0,
    express: 100
};

// ==========================================
// NAVIGATION - Active link highlighting
// ==========================================

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", function() {
    let current = "";

    // LOOP: Check each section to find which one is currently in view
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop - 120;
        
        // CONDITIONAL: Check if we've scrolled past this section
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    }

    // LOOP: Update active state for each nav link
    for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        link.classList.remove("active");
        
        // CONDITIONAL: Add active class if this link matches current section
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    }
});

// ==========================================
// PRICE CALCULATION - Using variables and conditionals
// ==========================================

function updatePrice() {
    // VARIABLES: Get form values
    const bookSelect = document.getElementById("bookSelect");
    const quantity = document.getElementById("quantity");
    const deliveryOptions = document.getElementsByName("delivery");
    const totalAmountElement = document.getElementById("totalAmount");
    
    // Get selected book price
    const selectedBookPrice = parseInt(bookSelect.value);
    const selectedQuantity = parseInt(quantity.value);
    
    // Initialize total
    let total = 0;
    
    // CONDITIONAL: Check if a book is selected
    if (selectedBookPrice > 0 && selectedQuantity > 0) {
        total = selectedBookPrice * selectedQuantity;
        
        // LOOP: Check which delivery option is selected
        for (let i = 0; i < deliveryOptions.length; i++) {
            // CONDITIONAL: If this radio button is checked
            if (deliveryOptions[i].checked) {
                const deliveryType = deliveryOptions[i].value;
                total = total + deliveryCharges[deliveryType];
            }
        }
    }
    
    // Update the display
    totalAmountElement.textContent = total;
}

// ==========================================
// FORM SUBMISSION - Validation using conditionals
// ==========================================

const orderForm = document.getElementById("orderForm");
const orderMessage = document.getElementById("orderMessage");

orderForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent actual form submission
    
    // VARIABLES: Get all form values
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const bookSelect = document.getElementById("bookSelect");
    const quantity = document.getElementById("quantity").value;
    const totalAmount = document.getElementById("totalAmount").textContent;
    
    // Get selected payment method
    const paymentOptions = document.getElementsByName("payment");
    let selectedPayment = "";
    
    // LOOP: Find which payment method was selected
    for (let i = 0; i < paymentOptions.length; i++) {
        // CONDITIONAL: Check if this option is selected
        if (paymentOptions[i].checked) {
            selectedPayment = paymentOptions[i].value;
        }
    }
    
    // Get selected delivery type
    const deliveryOptions = document.getElementsByName("delivery");
    let selectedDelivery = "";
    
    // LOOP: Find which delivery option was selected
    for (let i = 0; i < deliveryOptions.length; i++) {
        // CONDITIONAL: Check if this option is selected
        if (deliveryOptions[i].checked) {
            selectedDelivery = deliveryOptions[i].value;
        }
    }
    
    // CONDITIONAL: Validate that all required fields are filled
    if (fullName === "" || email === "" || bookSelect.value === "") {
        orderMessage.textContent = "Please fill in all required fields!";
        orderMessage.className = "order-message show";
        orderMessage.style.background = "#fee2e2";
        orderMessage.style.color = "#991b1b";
        orderMessage.style.border = "2px solid #dc2626";
        return;
    }
    
    // CONDITIONAL: Check if payment method is selected
    if (selectedPayment === "") {
        orderMessage.textContent = "Please select a payment method!";
        orderMessage.className = "order-message show";
        orderMessage.style.background = "#fee2e2";
        orderMessage.style.color = "#991b1b";
        orderMessage.style.border = "2px solid #dc2626";
        return;
    }
    
    // CONDITIONAL: Check if delivery type is selected
    if (selectedDelivery === "") {
        orderMessage.textContent = "Please select a delivery type!";
        orderMessage.className = "order-message show";
        orderMessage.style.background = "#fee2e2";
        orderMessage.style.color = "#991b1b";
        orderMessage.style.border = "2px solid #dc2626";
        return;
    }
    
    // Get selected book name
    const selectedBookName = bookSelect.options[bookSelect.selectedIndex].text;
    
    // Display success message
    let paymentText = "";
    // CONDITIONAL: Convert payment code to readable text
    if (selectedPayment === "cod") {
        paymentText = "Cash on Delivery";
    } else if (selectedPayment === "upi") {
        paymentText = "UPI";
    } else if (selectedPayment === "card") {
        paymentText = "Debit/Credit Card";
    }
    
    let deliveryText = "";
    // CONDITIONAL: Convert delivery code to readable text
    if (selectedDelivery === "standard") {
        deliveryText = "Standard Delivery";
    } else if (selectedDelivery === "express") {
        deliveryText = "Express Delivery";
    }
    
    orderMessage.innerHTML = `
        <strong>✓ Order Placed Successfully!</strong><br>
        <br>
        Thank you, ${fullName}!<br>
        Book: ${selectedBookName}<br>
        Quantity: ${quantity}<br>
        Total: ₹${totalAmount}<br>
        Payment: ${paymentText}<br>
        Delivery: ${deliveryText}<br>
        <br>
        Confirmation sent to ${email}
    `;
    orderMessage.className = "order-message show success";
    
    // Reset form after 5 seconds
    setTimeout(function() {
        orderForm.reset();
        orderMessage.classList.remove("show");
        updatePrice();
    }, 5000);
});

// ==========================================
// TABLE FILTER - Using loops and conditionals
// ==========================================

function filterBooks() {
    // VARIABLES: Get the selected category
    const filterSelect = document.getElementById("categoryFilter");
    const selectedCategory = filterSelect.value;
    
    // Get all table rows
    const tableRows = document.querySelectorAll("#tableBody tr");
    
    // LOOP: Go through each row
    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const rowCategory = row.getAttribute("data-category");
        
        // CONDITIONAL: Show or hide based on filter
        if (selectedCategory === "all") {
            // Show all rows
            row.style.display = "";
        } else if (rowCategory === selectedCategory) {
            // Show matching rows
            row.style.display = "";
        } else {
            // Hide non-matching rows
            row.style.display = "none";
        }
    }
}

// ==========================================
// BOOK STATISTICS - Using loops to calculate
// ==========================================

function calculateBookStats() {
    // VARIABLES: Initialize counters
    let totalBooks = 0;
    let totalValue = 0;
    let cheapestPrice = 9999;
    let mostExpensivePrice = 0;
    
    const tableRows = document.querySelectorAll("#tableBody tr");
    
    // LOOP: Go through each book
    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const priceCell = row.cells[2]; // Third column has the price
        const price = parseInt(priceCell.textContent);
        
        totalBooks = totalBooks + 1;
        totalValue = totalValue + price;
        
        // CONDITIONAL: Check if this is the cheapest book
        if (price < cheapestPrice) {
            cheapestPrice = price;
        }
        
        // CONDITIONAL: Check if this is the most expensive book
        if (price > mostExpensivePrice) {
            mostExpensivePrice = price;
        }
    }
    
    // Calculate average
    const averagePrice = totalValue / totalBooks;
    
    // You can use these stats - for now, just logging to console
    console.log("=== Book Store Statistics ===");
    console.log("Total Books:", totalBooks);
    console.log("Total Catalog Value: ₹" + totalValue);
    console.log("Average Price: ₹" + averagePrice.toFixed(2));
    console.log("Cheapest Book: ₹" + cheapestPrice);
    console.log("Most Expensive: ₹" + mostExpensivePrice);
}

// Calculate stats when page loads
calculateBookStats();

// ==========================================
// DISCOUNT CALCULATOR - Practice with conditionals
// ==========================================

function calculateDiscount(total) {
    let discount = 0;
    
    // CONDITIONAL: Apply discount based on total amount
    if (total > 1000) {
        discount = total * 0.15; // 15% discount
    } else if (total > 500) {
        discount = total * 0.10; // 10% discount
    } else if (total > 300) {
        discount = total * 0.05; // 5% discount
    }
    
    return discount;
}

// You can uncomment this to test the discount function
// console.log("Discount on ₹600:", calculateDiscount(600));
// console.log("Discount on ₹1500:", calculateDiscount(1500));