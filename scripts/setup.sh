#!/bin/bash

# IBT Bridge Setup Script
# This script helps set up the development environment

set -e

echo "🌉 IBT Bridge Setup"
echo "=================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found. Please install Foundry:"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   foundryup"
    exit 1
fi
echo "✅ Foundry installed"

if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI not found. Please install Sui CLI:"
    echo "   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui"
    exit 1
fi
echo "✅ Sui CLI installed"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js installed"

echo ""
echo "Setting up Ethereum contracts..."
cd ethereum
if [ ! -d "lib/openzeppelin-contracts" ]; then
    echo "Installing OpenZeppelin contracts..."
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
fi
echo "✅ Ethereum contracts ready"

echo ""
echo "Setting up Sui contracts..."
cd ../sui
echo "✅ Sui contracts ready"

echo ""
echo "Setting up web application..."
cd ../web
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
echo "✅ Web application ready"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Anvil: anvil --host 0.0.0.0 --port 8545"
echo "2. Start Sui validator: sui-test-validator"
echo "3. Deploy contracts (see DEPLOYMENT.md)"
echo "4. Configure .env.local in web/ directory"
echo "5. Start web app: cd web && npm run dev"

