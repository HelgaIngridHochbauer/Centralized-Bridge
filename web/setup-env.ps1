# Setup environment variables for the web app
# Run this script from the web directory

$envContent = @"
NEXT_PUBLIC_ETH_IBT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_ETH_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_SUI_PACKAGE_ID=0xfc0c4b867cdaffd73a16e4833eada2d56151e1c4dcdde99a3978f48bddd47163
NEXT_PUBLIC_SUI_TREASURY_CAP=0xb1cce492a964f21d5d89d1f74d8013ba334aa5197ac2fa8edc45f25e72252857
NEXT_PUBLIC_SUI_RPC_URL=http://127.0.0.1:9000
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "✅ Created .env.local file with your contract addresses!" -ForegroundColor Green
Write-Host ""
Write-Host "Contract addresses configured:"
Write-Host "  Ethereum: 0x5FbDB2315678afecb367f032d93F642f64180aa3"
Write-Host "  Sui Package: 0xfc0c4b867cdaffd73a16e4833eada2d56151e1c4dcdde99a3978f48bddd47163"
Write-Host "  Sui TreasuryCap: 0xb1cce492a964f21d5d89d1f74d8013ba334aa5197ac2fa8edc45f25e72252857"
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
