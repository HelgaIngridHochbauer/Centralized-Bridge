# 🌉 IBT Bridge - Cross-Chain Token Bridge

A centralized bridge application that allows users to transfer IBT (Inter-Blockchain Token) tokens between Ethereum and Sui blockchains.

<img width="1650" height="913" alt="image" src="https://github.com/user-attachments/assets/a5e52bde-9fed-46dd-a9d3-df3e22e2c909" />


## Features

- ✅ Dual blockchain support (Ethereum via Anvil, Sui localnet)
- ✅ IBT token contracts on both chains (mintable/burnable by deployer)
- ✅ Web interface with MetaMask and Sui Wallet integration
- ✅ Cross-chain token bridging (burn on source, mint on destination)
- ✅ Real-time balance display
- ✅ Modern, responsive UI

<img width="1417" height="919" alt="image" src="https://github.com/user-attachments/assets/51e9dd17-e85e-4126-b802-06b7db67c08f" />

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **Foundry** (for Ethereum development)
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```
3. **Sui CLI** (for Sui development)
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
   ```
4. **MetaMask** browser extension (for Ethereum wallet)
5. **Sui Wallet** browser extension (for Sui wallet)

## Project Structure

```
.
├── ethereum/          # Ethereum smart contracts
│   ├── contracts/     # Solidity contracts
│   └── scripts/       # Deployment scripts
├── sui/              # Sui smart contracts
│   └── contracts/     # Move contracts
└── web/              # Next.js web application
    ├── app/          # Next.js app directory
    └── components/   # React components
```

## Architecture Diagram

```
┌─────────────────┐                      ┌─────────────────┐
│    ETHEREUM     │                      │       SUI       │
│                 │                      │                 │
│  IBT Token      │ ──── Bridge ────►    │  IBT Token      │
│  (ERC-20)       │                      │  (Coin)         │
│                 │                      │                 │
│  burn           │                      │    receive      │
│  tokens here    │                      │  tokens here    │
└─────────────────┘                      └─────────────────┘

```

## Setup Instructions

### 1. Start Ethereum Local Chain (Anvil)

```bash
# In a terminal, start Anvil
anvil --host 0.0.0.0 --port 8545
```

This will start a local Ethereum node on `http://127.0.0.1:8545` with 10 test accounts.

### 2. Deploy Ethereum Contract

```bash
cd ethereum

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts

# Deploy the IBT contract
forge script scripts/deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Note the deployed contract address from the output
```

### 3. Start Sui Local Chain

```bash
# In a new terminal, start Sui localnet
sui-test-validator
```

This starts a Sui local validator on the default port.

### 4. Deploy Sui Contract

```bash
# In a new terminal
cd sui

# Build the contract
sui move build

# Deploy the contract
sui client publish --gas-budget 100000000

# Note the published package ID and TreasuryCap object ID from the output
```

### 5. Setup Web Application

```bash
cd web

# Install dependencies
npm install

# Create a .env.local file with your contract addresses
cat > .env.local << EOF
NEXT_PUBLIC_ETH_IBT_ADDRESS=<your-ethereum-contract-address>
NEXT_PUBLIC_ETH_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_SUI_PACKAGE_ID=<your-sui-package-id>
NEXT_PUBLIC_SUI_TREASURY_CAP=<your-treasury-cap-object-id>
NEXT_PUBLIC_SUI_RPC_URL=http://127.0.0.1:9000
EOF

# Start the development server
npm run dev
```

The web application will be available at `http://localhost:3000`.

## Usage

1. **Connect Wallets**:
   - Click "Connect" for Ethereum to connect MetaMask
   - Click "Connect" for Sui to connect Sui Wallet

2. **View Balances**:
   - Your IBT token balances on both chains will be displayed

3. **Bridge Tokens**:
   - Select the direction (Ethereum → Sui or Sui → Ethereum)
   - Enter the amount to bridge
   - Click "Bridge Tokens"
   - Approve the transaction in your wallet

## How It Works

### Centralized Bridge Architecture

This bridge uses a centralized approach where:

1. **Source Chain**: Tokens are burned from the user's address by the contract owner
2. **Destination Chain**: Tokens are minted to the user's address by the contract owner

### Current Implementation

The current implementation demonstrates the core functionality:
- Users can burn tokens on the source chain via the web interface
- The deployer (bridge operator) can mint tokens on the destination chain
- The web interface provides a seamless UX for the burn operation
- For the centralized bridge, after a burn on the source chain, the deployer manually mints on the destination chain

## Development

### Ethereum Contract

The Ethereum IBT contract is a standard ERC20 token with:
- `mint(address to, uint256 amount)`: Mint tokens (owner only)
- `burn(address from, uint256 amount)`: Burn tokens (owner only)

### Sui Contract

The Sui IBT contract uses Move's coin framework with:
- `mint()`: Mint tokens to a recipient (treasury cap holder only)
- `burn()`: Burn tokens from a coin (treasury cap holder only)

### Web Application

Built with:
- **Next.js 14** (App Router)
- **React 18**
- **ethers.js** (Ethereum interactions)
- **@mysten/dapp-kit** (Sui wallet integration)
- **Tailwind CSS** (styling)

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Add the local network manually if it doesn't switch automatically
- Network details: Chain ID 31337, RPC URL http://127.0.0.1:8545

### Sui Wallet Issues
- Ensure Sui Wallet extension is installed
- Make sure `sui-test-validator` is running
- Check that you're connected to the localnet network

### Contract Deployment
- Verify Anvil is running before deploying Ethereum contracts
- Verify Sui validator is running before deploying Sui contracts
- Check that contract addresses are correctly set in `.env.local`



