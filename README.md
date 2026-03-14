# 🎂 HarshCakes — Bakery Business Suite

## Quick Start

### 1. Setup environment
```bash
cd server
cp .env.example .env
# Fill in your MongoDB URI, Cloudinary keys, Twilio keys, UPI ID
```

### 2. Install dependencies
```bash
# From bakery-suite root
npm run install:all
```

### 3. Run
```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev:client
```

App runs at: http://localhost:3000  
API runs at: http://localhost:5000

---

## Features
- **Financial Dashboard** — Revenue, Expenses, Net Profit, monthly chart
- **Order Management** — Create orders, track status, auto WhatsApp on Ready
- **Expense Tracker** — Log spends with drag-and-drop bill photo upload (Cloudinary)
- **Digital Receipt** — Printable receipt page with UPI deep link
- **Feedback System** — Star rating form saved to DB

## WhatsApp Setup (Twilio Sandbox)
1. Go to [Twilio Console](https://console.twilio.com)
2. Enable WhatsApp Sandbox
3. Add your Twilio credentials to `.env`

## Cloudinary Setup
1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret to `.env`
