# MicroLoan DAO

Decentralized Microloan Platform powered by Next.js, Reown (WalletConnect), and Hardhat.

## Features

- **Wallet Connection**: Authenticate using Reown AppKit (WalletConnect).
- **Request Loan**: Users can request ETH loans with specified terms.
- **Fund Loan**: Community members can fund active loan requests.
- **Repay Loan**: Borrowers can repay loans to increase reputation.
- **Reputation System**: Track user reputation off-chain based on repayment history.
- **Auto-Commit**: Dev tool to automatically commit changes.

## Tech Stack

- **Frontend**: Next.js 16, NativeWind (Tailwind CSS), Wagmi, Reown AppKit.
- **Backend**: Next.js API Routes, Prisma (SQLite).
- **Blockchain**: Hardhat, Solidity (MicroLoanDAO contract).

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Smart Contract**
   - Compile:
     ```bash
     npx hardhat compile
     ```
   - Deploy (Localhost):
     ```bash
     npx hardhat node
     # In new terminal
     npx hardhat run scripts/deploy-contract.ts --network localhost
     ```
   - Update `MICROLOAN_CONTRACT_ADDRESS` in `.env` or `src/config/index.tsx`.

4. **Run App**
   ```bash
   npm run dev
   ```

5. **Auto-Commit Mode**
   ```bash
   npm run watch-commit
   ```

## Project Structure

- `contracts/`: Solidity smart contracts.
- `src/app/`: Next.js pages and API routes.
- `src/components/`: React components.
- `src/lib/`: Utilities (Prisma client).
- `scripts/`: Automation scripts.

## License

MIT
