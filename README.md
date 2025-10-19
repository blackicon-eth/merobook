# Merobook 📖

Merobook is a decentralized peer-to-peer social network that leverages Calimero technology for distributed infrastructure. Users can create posts, follow others, like content, and tip creators with USDC - all in a truly decentralized environment.

## How is it made?

Merobook architecture is divided into two main components:

**Backend (Rust + WASM)**: The core logic is written in Rust using the Calimero SDK and compiled to WebAssembly. This handles all data structures (users, posts, likes, tips, followers) and business logic in a decentralized manner. Each peer in the network runs an instance of the compiled WASM application, ensuring data consistency across the network through Calimero's consensus mechanisms.

**Frontend (Vite + React)**: The user interface is built with modern React, TypeScript, and Tailwind CSS, providing a responsive and intuitive experience. The frontend communicates with the Calimero network through an auto-generated TypeScript client from the Rust ABI, ensuring type safety across the stack.

When users log in, they connect to a peer-to-peer server (node) in the Calimero network. After creating a profile with their name, bio, avatar, and optional Ethereum wallet address, they can immediately start interacting with the global feed. Posts are synchronized across all nodes in real-time, creating a seamless social media experience without centralized servers.

The tipping functionality integrates RainbowKit and Wagmi for Ethereum wallet connections, allowing users to send USDC (on base mainnet) directly to post creators. Tips are recorded on-chain while metadata is tracked in the Calimero network, providing both transparency and efficient data management.

ENS integration enhances the user experience by resolving wallet addresses to human-readable names throughout the interface. When viewing profiles or transaction histories, users see familiar ENS names instead of hexadecimal addresses, making the social experience more personal and accessible.

## Features

- **Decentralized Architecture**: Fully distributed P2P network with no central authority
- **User Profiles**: Customizable profiles with avatar, bio, and optional Ethereum wallet
- **Social Feed**: Browse posts from all users in the network
- **Engagement**: Like posts and follow other users
- **USDC Tipping**: Send tips to content creators using USDC on Base Mainnet
- **Search**: Find users by name with real-time search
- **Following Feed**: View posts only from users you follow
- **ENS Integration**: Wallet addresses displayed as ENS names for improved UX
- **Image Support**: Upload images to posts via imgbb integration
- **Profile Management**: Edit your profile information and view your statistics

## Bounties

- **ENS**: Merobook implements ENS name resolution to improve the overall user experience. Throughout the application, Ethereum wallet addresses are automatically resolved to their corresponding ENS names, making profiles and transactions more human-readable and accessible. This creates a more familiar social media experience while maintaining blockchain transparency.

- **Calimero**: The entire Merobook social network is built leveraging Calimero peer-to-peer technology and framework. The project's structure is divided into a backend part written in Rust that manages the logic of the app (posts, users, tips, likes, followers) and a frontend part that uses Vite and React to provide the UI. All data is synchronized across the decentralized network using Calimero's consensus mechanisms, eliminating the need for centralized servers.

## Architecture

```
merobook/
├── logic/                    # Rust backend
│   ├── src/
│   │   └── lib.rs           # Core logic (users, posts, likes, tips, follows)
│   └── Cargo.toml
├── app/                      # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── AbiClient.ts # Auto-generated Calimero client
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── contexts/         # React contexts
│   │   └── hooks/            # Custom hooks
│   └── package.json
├── workflows/                # Calimero workflow definitions
└── data/                     # Local node data
```

## Installation Steps

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm/yarn
- Rust toolchain (for backend development)
- Calimero CLI (`npm install -g @calimero-is/merobox-cli`)

### Setup

Choose your preferred package manager:

```bash
# Using pnpm (recommended)
pnpm install
pnpm logic:build        # Build Rust backend
pnpm app:generate-client # Generate TypeScript client
pnpm network:bootstrap  # Start local Calimero network
pnpm app:dev            # Start frontend development server

# Using npm
npm install
npm run logic:build
npm run app:generate-client
npm run network:bootstrap
npm run app:dev

# Using yarn
yarn install
yarn logic:build
yarn app:generate-client
yarn network:bootstrap
yarn app:dev
```

### Configuration

1. **imgbb API Key** (optional, for image uploads):

   - Get a free API key from [imgbb.com](https://api.imgbb.com/)
   - Update the key in `app/src/lib/upload-image.ts`

2. **Wallet Connection**:
   - The app uses RainbowKit with Base Mainnet
   - Configure your WalletConnect Project ID in the connector context if needed

## Available Scripts

- `pnpm logic:build` - Build the Rust backend to WASM
- `pnpm app:generate-client` - Generate TypeScript client from Rust ABI
- `pnpm network:bootstrap` - Bootstrap local Calimero network with demo data
- `pnpm network:stop` - Stop all running Calimero nodes
- `pnpm app:dev` - Start frontend development server
- `pnpm app:build` - Build frontend for production

## Technology Stack

- **Backend**: Rust, Calimero SDK, WebAssembly
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Wallet Integration**: RainbowKit, Wagmi
- **ENS**: ENS resolution via ethers.js
- **Blockchain**: Base Mainnet (for USDC tips)
- **P2P Network**: Calimero Framework

## Useful Links

- [Repository](https://github.com/blackicon-eth/merobook)
- [Video Demo](https://youtu.be/8sRVwrL4sHo)
- [Calimero Documentation](https://docs.calimero.network/)
- [ENS Documentation](https://docs.ens.domains/)

## Contact

Built by [blackicon.eth](https://t.me/blackicon_eth)

## License

MIT
