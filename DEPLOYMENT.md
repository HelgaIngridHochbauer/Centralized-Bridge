# Deployment Guide

This guide walks you through deploying the IBT Bridge contracts and setting up the web application.

## Prerequisites

Ensure you have:
- Foundry installed (`foundryup`)
- Sui CLI installed
- Node.js 18+ installed
- MetaMask browser extension
- Sui Wallet browser extension

## Step 1: Start Local Blockchains

### Start Anvil (Ethereum)

```bash
anvil --host 0.0.0.0 --port 8545
```

Keep this terminal open. You'll see output like:
```
Listening on 0.0.0.0:8545
```

Note the private keys and addresses displayed. The first account's private key is:
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### Start Sui Validator

In a new terminal:

```bash
sui-test-validator
```

Keep this terminal open. The validator will start on the default port.

## Step 2: Deploy Ethereum Contract

In a new terminal:

```bash
cd ethereum

# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts

# Deploy the contract (using the first Anvil account)
forge script scripts/deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Important**: Copy the deployed contract address from the output. It will look like:
```
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Step 3: Deploy Sui Contract

In a new terminal:

```bash
cd sui

# Build the contract
sui move build

# Deploy the contract
sui client publish --gas-budget 100000000
```

**Important**: From the output, copy:
1. **Published Package ID** - looks like `0x...`
2. **TreasuryCap Object ID** - look for "TreasuryCap" in the "Created Objects" section

Example output:
```
Published Objects:
  PackageID: 0x1234567890abcdef...
  
Created Objects:
  TreasuryCap: 0xabcdef1234567890...
```

## Step 4: Mint Initial Tokens (Optional)

### Mint on Ethereum

```bash
cd ethereum

# Mint 1000 IBT tokens to your address
cast send $ETH_IBT_ADDRESS \
  "mint(address,uint256)" \
  YOUR_ADDRESS 1000000000000000000000 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Mint on Sui

```bash
# Mint 1000 IBT tokens (1000000000000 in smallest units with 9 decimals)
sui client call \
  --package $SUI_PACKAGE_ID \
  --module ibt \
  --function mint \
  --args $SUI_TREASURY_CAP YOUR_SUI_ADDRESS 1000000000000 \
  --gas-budget 100000000
```

## Step 5: Configure Web Application

```bash
cd web

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_ETH_IBT_ADDRESS=<your-ethereum-contract-address>
NEXT_PUBLIC_ETH_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_SUI_PACKAGE_ID=<your-sui-package-id>
NEXT_PUBLIC_SUI_TREASURY_CAP=<your-sui-treasury-cap-object-id>
NEXT_PUBLIC_SUI_RPC_URL=http://127.0.0.1:9000
EOF
```

Replace the placeholders with your actual values from steps 2 and 3.

## Step 6: Start Web Application

```bash
cd web
npm run dev
```

Open your browser to `http://localhost:3000`

## Step 7: Connect Wallets

1. **Ethereum (MetaMask)**:
   - Click "Connect" for Ethereum
   - Approve the connection in MetaMask
   - If prompted, add the local network (Chain ID: 31337)

2. **Sui (Sui Wallet)**:
   - Click "Connect" for Sui
   - Approve the connection in Sui Wallet
   - Ensure you're connected to "localnet"

## Testing the Bridge

1. Ensure you have IBT tokens on one chain (mint them if needed)
2. Select the bridge direction (Ethereum → Sui or Sui → Ethereum)
3. Enter the amount to bridge
4. Click "Bridge Tokens"
5. Approve the transaction in your wallet
6. Wait for confirmation
7. Check your balance on the destination chain

## Troubleshooting

### MetaMask Not Connecting
- Ensure Anvil is running
- Check that you've added the local network (Chain ID: 31337)
- Try resetting your MetaMask account

### Sui Wallet Not Connecting
- Ensure `sui-test-validator` is running
- Check that you're on the "localnet" network in Sui Wallet
- Try refreshing the page

### Contract Not Found
- Verify contract addresses in `.env.local` are correct
- Ensure contracts were deployed successfully
- Check that the local chains are still running

### Balance Not Updating
- Wait a few seconds for the balance to refresh
- Try disconnecting and reconnecting your wallets
- Check the browser console for errors

