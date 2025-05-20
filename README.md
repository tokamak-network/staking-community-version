# Staking Community Version Setup Guide

This document provides a step-by-step guide to set up and run the **staking-community-version** service in both development and production environments.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Project Installation](#project-installation)
4. [Running in Development](#running-in-development)
5. [Building and Running in Production](#building-and-running-in-production)
6. [Linting and Formatting](#linting-and-formatting)

---

## 🔧 Prerequisites

- **Node.js** v20 or higher (LTS recommended)
- **npm** v10 or higher (or **pnpm**)
- **Git** client

> Check versions:
> ```bash
> node -v
> npm -v
> ```

---

## 🌐 Environment Variables

Create a file named `.env.local` in the project root and set the following variables:

```env
NEXT_PUBLIC_APP_MODE=DEV
NEXT_PUBLIC_ETHEREUM_RPC=<YOUR_ETHEREUM_MAINNET_RPC>
NEXT_PUBLIC_SEPOLIA_RPC=<YOUR_SEPOLIA_TESTNET_RPC>
```

- `NEXT_PUBLIC_APP_MODE`: Application mode (`DEV` or `PRODUCTION`).
- `NEXT_PUBLIC_ETHEREUM_RPC`: Ethereum Mainnet RPC endpoint.
- `NEXT_PUBLIC_SEPOLIA_RPC`: Sepolia Testnet RPC endpoint.

---

## 📦 Project Installation

```bash
# Clone the repository
git clone tokamak-network/staking-community-version
cd staking-community-version

# Install dependencies using npm
npm install

# Or using pnpm
pnpm install
```

---

## 🚀 Running in Development

Start the local development server:

```bash
npm run dev
```

- The app will be available at `http://localhost:3000`.
- Hot-reloading enabled for rapid development.

---

## 📈 Building and Running in Production

1. **Build** the optimized production bundle:
   ```bash
   npm run build
   ```

2. **Start** the production server:
   ```bash
   npm start
   ```

- Uses Next.js production server with performance optimizations.

---

## 🧹 Linting and Formatting

Ensure code quality by running ESLint:

```bash
npm run lint
```

