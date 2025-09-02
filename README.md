# Staking Community Version

> **A Community Version DApp for Tokamak Network's Staking Service**

Staking Community Version is a **DeFi staking application** that allows you to earn rewards by staking your TON and WTON tokens on the Tokamak Network.

## What This App Does

This is a **DeFi staking application** that allows you to:

- **Earn rewards** by staking your TON and WTON tokens
- **Choose validators** (operators) to stake with
- **Automatically reinvest** your earnings for compound growth
- **Connect your wallet** securely using MetaMask or other popular wallets
- **View real-time data** about your staking performance and rewards

The app works on **Ethereum mainnet** (for real transactions) and **Sepolia testnet** (for testing with fake tokens).

## Requirements

### What You Need
- **A computer** with Windows, Mac, or Linux
- **Internet connection** to download and run the app
- **A Web3 wallet** like MetaMask (recommended for beginners)

### Supported Networks
- **Ethereum Mainnet** - Production network for real transactions
- **Sepolia Testnet** - Test network for development and testing

## Quick Start

### Option 1: Run Locally (For Advanced Users)


**Step 1: Install Required Software**

**Windows Users:**
1. Download and install [Node.js](https://nodejs.org/) - **Choose the LTS version (Recommended)**
2. Download and install [Git for Windows](https://git-scm.com/download/win)

**Mac Users:**
1. Download and install [Node.js](https://nodejs.org/) - **Choose the LTS version (Recommended)**
2. Download and install [Git for Mac](https://git-scm.com/download/mac)

**Linux Users:**
```bash
sudo apt update
sudo apt install nodejs npm git
```

**Step 2: Verify Installation**
Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:
```bash
node --version
npm --version
git --version
```
You should see version numbers for each command.

**Step 3: Download the App**
1. **Open Command Prompt (Windows) or Terminal (Mac/Linux)**
2. **Navigate to where you want to install the app** (e.g., Desktop):
   ```bash
   # Windows
   cd C:\Users\YourUsername\Desktop
   
   # Mac/Linux
   cd ~/Desktop
   ```
3. **Download the app:**
   ```bash
   git clone https://github.com/tokamak-network/staking-community-version.git
   cd staking-community-version
   ```

**Step 4: Install Dependencies**
```bash
npm install
```
This may take a few minutes. Wait until you see a success message.

**Step 5: Start the App**
```bash
npm run dev
```

The app will open in your browser at `http://localhost:3000`.

<!-- #### Option 2: Docker Installation (Easier, No Software Installation Required)

**What is Docker?**
Docker is a tool that packages everything needed to run an application into a "container" - like a pre-built box that contains everything the app needs.

**Step 1: Install Docker**

**Windows Users:**
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Install and restart your computer
3. Start Docker Desktop (it will appear in your system tray)

**Mac Users:**
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Install and restart your computer
3. Start Docker Desktop (it will appear in your menu bar)

**Linux Users:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and log back in
```

**Step 2: Verify Docker Installation**
Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:
```bash
docker --version
docker-compose --version
```

**Step 3: Download and Run the App**
1. **Open Command Prompt (Windows) or Terminal (Mac/Linux)**
2. **Navigate to where you want to install the app:**
   ```bash
   # Windows
   cd C:\Users\YourUsername\Desktop
   
   # Mac/Linux
   cd ~/Desktop
   ```
3. **Download the app:**
   ```bash
   git clone https://github.com/tokamak-network/staking-community-version.git
   cd staking-community-version
   ```
4. **Run with Docker:**
   ```bash
   docker run -p 3000:3000 -v $(pwd):/app -w /app node:18 npm install
   docker run -p 3000:3000 -v $(pwd):/app -w /app node:18 npm run dev
   ```

**Note for Windows Users:** Replace `$(pwd)` with `%cd%` in the commands above.

The app will be available at `http://localhost:3000`. -->

<!-- ## 🔧 Troubleshooting

### Common Issues

#### 1. Wallet Connection Problems
- **Make sure MetaMask is installed** and unlocked
- **Check if you're on the right network** (Ethereum mainnet or Sepolia testnet)
- **Try refreshing the page** if the connection fails

#### 2. App Won't Start
- **Check if Node.js is installed** by running `node --version` in terminal
- **Make sure you're in the right folder** (staking-community-version)
- **Try deleting the `node_modules` folder** and running `npm install` again

#### 3. Can't See Your Tokens
- **Make sure you have TON or WTON tokens** in your wallet
- **Check if you're connected to the right network**
- **Verify your wallet is connected** to the app

#### 4. Docker Issues
- **Make sure Docker Desktop is running** (check system tray/menu bar)
- **Try restarting Docker Desktop** if commands fail
- **For Windows users**, make sure WSL2 is enabled -->

## How to Use the App

### First Time Setup

1. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Choose MetaMask (recommended for beginners)
   - Approve the connection in your wallet

2. **Switch to the Right Network**
   - Make sure you're on Ethereum mainnet (for real transactions)
   - Or Sepolia testnet (for testing)

3. **Check Your Balance**
   - The app will show your TON and WTON token balances
   - Make sure you have tokens to stake

### Staking Your Tokens

1. **Choose What to Stake**
   - Select TON or WTON tokens
   - Enter the amount you want to stake

2. **Pick an Operator**
   - Browse the list of available validators
   - Check their performance and commission rates
   - Select the one you prefer

3. **Confirm the Transaction**
   - Review the staking details
   - Approve the transaction in your wallet
   - Wait for confirmation

### Managing Your Stakes

- **View your staking info** in the dashboard
- **Claim rewards** when they're available
- **Restake rewards** to earn compound interest
- **Unstake tokens** when you want to withdraw

<!-- ## 🚀 Deployment

### For End Users

You don't need to worry about deployment! Just use the live app or follow the local setup instructions above.

### For Developers

If you're a developer and want to deploy this app:

#### Vercel (Easiest)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

#### Docker
1. Build: `docker build -t staking-community-version .`
2. Run: `docker run -p 3000:3000 staking-community-version` -->

## 🤝 Contributing

Want to help improve this app?

1. **Report bugs** on GitHub
2. **Suggest new features** in Discord
3. **Help other users** in the community
4. **Contribute code** if you're a developer

## 📞 Support & Contact

- **Discord**: [Tokamak Network Discord](https://discord.gg/tokamak) - Best place for community help
- **Telegram**: [Tokamak Network Telegram](https://t.me/tokamak_network)
- **GitHub Issues**: [Report bugs or request features](https://github.com/tokamak-network/staking-community-version/issues)
- **Email**: support@tokamak.network

## 📄 License

This project is open source and distributed under the MIT License.

---

**Ready to start earning rewards?** Connect your wallet and begin staking with **Staking Community Version**! 🚀

*Need help? Join our Discord community for friendly support!*

