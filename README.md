# CampusReads

An online bookstore for campus students, built entirely client-side. Users can browse and purchase books, manage a persistent cart, track order history, and download PDF receipts — all without a backend or build step.

[Live Demo](https://srijani-das07.github.io/Campus-Reads/)

---

## Overview

All user data, cart state, and order history live in IndexedDB. There is no server and no database to set up.

The project implements:

- A complete auth system with route guards and session management
- IndexedDB as a structured client-side database with three object stores
- Three payment flows: UPI, card with live preview, and cash on delivery
- Client-side PDF receipt generation via jsPDF

---

## Project Structure

```
Campus-Reads/
├── index.html        # Login and register page
├── main.html         # Main storefront (protected route)
├── style.css         # All styles
├── db.js             # IndexedDB layer: users, orders, carts, session helpers
├── auth.js           # Auth logic: login, register, redirect guards
└── script.js         # App logic: books, cart, orders, payments, PDF
```

---

## Architecture

### Storage Layer
`db.js` manages three IndexedDB object stores:

- `users` — unique index on `email`
- `orders` — indexes on `userEmail` and `createdAt`
- `carts` — one record per `userEmail`

Session is stored in `sessionStorage` by default. Checking "Remember Me" writes to `localStorage` instead, persisting across tab closes.

Note: passwords are stored as plaintext in IndexedDB. Production use would require server-side hashing.

### Authentication and Route Guards
An IIFE runs on every page load and checks the active session. Unauthenticated users on `main.html` are sent to `index.html`, and authenticated users on `index.html` are sent to `main.html`.

### Cart Persistence
Cart state is written to IndexedDB on every change and restored from the database on login. Two users on the same device maintain separate cart records.

### Pricing Logic

| Component | Value |
|---|---|
| Delivery | ₹0 (Standard) or ₹100 (Express) |
| GST | 5% of subtotal |
| Discount | 10% of subtotal if subtotal > ₹1000 |
| Grand Total | Subtotal + Delivery + GST − Discount |

### Payment Flows

**UPI** — Mock screen with app shortcuts and a copyable UPI ID.

**Card** — Live card preview updates as number (masked), name, and expiry are entered. Simulated processing sequence runs before the order is placed.

**Cash on Delivery** — Single confirmation. Order status is set to "Pending Payment".

### PDF Receipt
Generated client-side via jsPDF after every successful order. Includes order ID, customer details, itemised list, bill breakdown, and payment status. Downloads as `CampusReads_Receipt_<orderID>.pdf`.

---

## Features

**Catalogue and Search**
- 10 books across 8 categories: Academic, Classic, Competitive Exams, Detective, Fantasy, Fiction, Programming, Thriller
- Card view and filterable table view
- Live search across title, author, and category
- Filter by category and price range; sort by name or price

**Cart**
- Quantity capped at available stock
- Persisted to IndexedDB per user, restored on login

**Order History**
- Stored in IndexedDB, sorted newest first
- Shows order ID, date, items, payment method, delivery type, status, and total

---

## Running Locally

### 1. Fork the repository
Click **Fork** on the top right of this page.

### 2. Clone the repo
```bash
git clone https://github.com/Srijani-Das07/Campus-Reads.git
```

### 3. Navigate into the folder
```bash
cd Campus-Reads
```

### 4. Open in browser
Open `index.html` directly. If IndexedDB throws an origin error, serve it locally:
```bash
npx serve .
# or
python -m http.server 8000
```
Then visit `http://localhost:8000`.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| HTML5, CSS3, Vanilla JS | Structure, styling, application logic |
| IndexedDB | Client-side structured storage |
| Web Storage API | Session management |
| jsPDF 2.5.1 | Client-side PDF generation |

---

## Limitations

- Data is browser-local with no cross-device sync
- Plaintext password storage due to no backend
- Hardcoded catalogue of 10 books

---

## Author
  
[Srijani Das](https://github.com/Srijani-Das07)
