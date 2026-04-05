# CashBook 🎓💸

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)

**CashBook** is a premium, full-stack personal finance application designed specifically for students to manage their expenses, track financial goals, and secure their data with biometric protection. Built with a modern, high-performance tech stack, it offers a seamless experience across mobile and web.

---

## ✨ Key Features

- **🔐 Biometric Security:** Enterprise-grade security using `FaceID`, `TouchID`, and Android Fingerprint sensors via Expo's `LocalAuthentication`.
- **🎯 Dynamic Goal Tracking:** Create and monitor savings goals with real-time progress bars and custom emoji identifiers.
- **📊 Instant Insights:** At-a-glance dashboard showing Total Balance, Income, and Expenses for the current month.
- **📄 PDF Export:** Generate professional transaction reports and share them instantly via the native iOS/Android share sheet.
- **☁️ Cloud Sync:** Real-time data synchronization across devices powered by Supabase.
- **🎨 Premium UI/UX:** A clean, modern interface using the `Inter` font family and smooth, frosted-glass animations.

---

## 🛠 Tech Stack

### Frontend (Mobile & Web)

- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Navigation:** [Expo Router](https://docs.expo.dev/routing/introduction/) (File-based routing)
- **State Management:** Custom React Contexts (Auth, Finance, AppLock)
- **Styling:** Native React Native styling with a focus on premium aesthetics.
- **Fonts:** [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts.

### Backend & Database

- **API Server:** [Express.js](https://expressjs.com/) (running in a workspace)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hosted on Supabase)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions.
- **Authentication:** [Supabase Auth](https://supabase.com/auth) with JWT-based sessions.
- **Validation:** [Zod](https://zod.dev/) for schema-based data validation.

---

## 📁 Project Structure

The project uses an **npm workspace** architecture to manage multiple packages efficiently:

```bash
CashBook/
├── artifacts/
│   ├── mobile/          # Expo Mobile Application
│   ├── api-server/      # Express.js Backend API
│   └── lib/             # Shared libraries (DB schema, types, etc.)
├── supabase/            # Database migrations and seed scripts
├── package.json         # Root workspace configuration
└── README.md            # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- [npm](https://www.npmjs.com/)
- [Expo Go](https://expo.dev/client) app installed on your phone.

### Installation

1. **Clone the repo:**

   ```powershell
   git clone https://github.com/farhanshahriyar/CashBook.git
   cd CashBook
   ```

2. **Install dependencies:**

   ```powershell
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root and in `artifacts/mobile/` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running Locally

You can run both the API and the Mobile app from the root directory:

#### 1. Start the API Server

```powershell
npm run dev:api
```

#### 2. Start the Mobile App

```powershell
npm run dev:mobile
```

> [!TIP]
> To run on your physical phone, ensure your computer and phone are on the same Wi-Fi. Scan the QR code in your terminal using the **Expo Go** app.

---

## 🔧 Troubleshooting

- **Connection Issues:** If Expo Go cannot connect to your computer, try running with the tunnel flag:
  ```powershell
  npx expo start --tunnel
  ```
- **Node Modules Error:** If you see "Failed to resolve module", ensure you've run `npm install` in the root (which installs for all workspaces).

---

## 🛡 Security & Privacy

CashBook prioritizes your financial privacy. All authentication is handled securely via Supabase, and biometric data never leaves your device. Local app locking ensures that even if your phone is unlocked, your financial data remains protected.

---

## 📄 License

This project is licensed under the MIT License. Created by [Farhan Shahriyar](https://github.com/farhanshahriyar).
