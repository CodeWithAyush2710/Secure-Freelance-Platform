# Secure Freelance Platform

A blockchain-based freelance platform with AI-powered contract review and dispute resolution.

## Project Structure

```
├── contracts/          # Smart contracts
├── backend/           # Express.js backend
├── frontend/          # React + Vite frontend
└── ai-services/       # AI agent services
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- MetaMask wallet
- Ganache (for local blockchain testing)
- Truffle/Hardhat (for smart contract development)

## Setup Instructions

1. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install contract dependencies
   cd ../contracts
   npm install
   ```

2. Set up environment variables:
   - Create `.env` files in backend and frontend directories
   - Configure MongoDB connection string
   - Set up JWT secret
   - Configure blockchain network settings

3. Start development servers:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # Start frontend
   cd ../frontend
   npm run dev
   ```

## Features

- Smart contract-based escrow system
- AI-powered contract review
- Dispute resolution with AI mediation
- Real-time chat monitoring
- Secure payment processing
- User authentication and authorization

## Development Roadmap

1. Phase 0: Project Setup ✅
2. Phase 1: Blockchain Development
3. Phase 2: Backend Development
4. Phase 3: Frontend Development
5. Phase 4: AI Integration
6. Phase 5: Payment Integration
7. Phase 6: Deployment & Testing

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details 