# Student Finance Hub (CashBook) 🎓💸

A premium, full-stack personal finance mobile application meticulously crafted for university students. CashBook provides a stunning user interface to securely track spending, budget monthly income, manage ambitious financial goals, and seamlessly export categorized data across devices.

## ✨ Key Features

- **Biometric App Lock:** Enterprise-grade security integrating FaceID, TouchID, and Fingerprint OS-level APIs globally so your balances remain aggressively protected from the second you background the app.
- **Active Goal Tracking:** Visually track what you're saving for with dynamic, color-coded progress bars, customized emojis, and real-time database syncing straight to your Home Dashboard.
- **One-Tap PDF Export:** Compile your entire transaction history, complete with a beautiful HTML summary layout, and hand it off natively to the iOS/Android Share Sheet to send, print, or save.
- **Complete Profile Management:** Keep your university, major, and role info up-to-date, alongside powerful "Clear All Data" and "Sign Out" flows protected by premium frosted-glass warning modals.
- **Instant Insights:** Clear visual metrics for Total Balance, Monthly Income, and Monthly Expenses.

## 🛠 Tech Stack

**Client Application:**
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **State/Hooks:** Custom React Contexts (`AuthContext`, `FinanceContext`, `AppLockContext`)
- **Typography:** `Inter` Google Fonts Family
- **Native Modules:** `expo-local-authentication`, `expo-print`, `expo-sharing`, `expo-haptics`

**Server & Database:**
- **Backend API:** Custom Express.js Server
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Supabase Auth
- **Deployment:** Optimized for Vercel Serverless Functions Edge routing

## 📁 Project Architecture

This project is structured as an npm workspace.
- `/artifacts/mobile/` - The frontend Expo ecosystem (Screens, Modals, Shared Contexts).
- `/artifacts/api-server/` - The backend Express server to handle complex data logic routines.
- `/supabase/` - SQL configuration schema, initial migrations, and seed data scripts.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- npm package manager (included with Node.js)
- Expo Go app on your physical device, or an iOS/Android simulator.
- A configured Supabase project (for both Auth & DB).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/farhanshahriyar/CashBook.git
   cd CashBook
   ```

2. **Install global workspace dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Copy the `.env.example` files to `.env` in the root and workspace directories.
   - Update them with your Supabase credentials:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
     - `DATABASE_URL` (for the API server, if applicable)

### 🏃‍♂️ Running Locally

The project is configured so you can run the mobile app and the API server separately from the root directory using npm scripts.

**Start the API Server (runs on port 3000):**
```bash
npm run dev:api
```

**Start the Mobile App (Expo, runs on port 8081):**
```bash
npm run dev:mobile
```

*Note: Make sure your `api-server` is running in a separate terminal so the mobile app can communicate with it.*

## 🔒 Security

CashBook does not share any telemetry or financial data with third parties. All context is tethered directly to your connected Supabase authentication layer, and protected locally inside the device keychain and biometric hardware enclaves.
