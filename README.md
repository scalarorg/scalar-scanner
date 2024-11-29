# scalar-xchains-scanner

> 2024-11-29 @DanteBartel

## 🌟 Overview

This project is a Next.js application that provides a scanner for the Scalar project. It provides a friendly UI to review General Message Passing (GMP), transactions on multiple chains (BTC, Sepolia, etc.), addresses, and other data related to the cross-chain staking/unstaking process.

## 🌟 Prerequisites

- node >= 20.0.0

## 🌟 Key Features

- Review GMPs and details of each message
- Review transaction status on multiple chains

## 🌟 Components

The application is structured with the following key components:

### Core Components

#### Layout Components

- **Layout**: Main layout wrapper providing consistent structure across pages. Handles header, footer, and status message display.

  - Supports dark/light theme
  - Responsive design with Tailwind CSS
  - Configurable header/footer visibility

- **Header**: Navigation and environment controls

  - Environment selector (mainnet, testnet, etc.)
  - Theme toggle
  - Search functionality
  - Navigation menu with mobile responsiveness

- **Footer**: Application footer with:
  - Social links (Twitter/X)
  - Container-based layout
  - Responsive design

#### Data Display Components

- **Overview**: Dashboard component showing cross-chain activity

  - Network metrics display
  - Transaction statistics
  - Network graph visualization
  - Sankey chart for data flow visualization

- **GMP (General Message Passing)**: Displays cross-chain message information

  - Message status tracking
  - Transaction details
  - Chain-specific information
  - Copy functionality for addresses and IDs

- **Resources**: Chain and asset information display
  - Chain status indicators
  - Network endpoints
  - Contract addresses
  - Support for both EVM and Cosmos chains

#### Utility Components

- **Copy**: Reusable component for copying data

  - Clipboard functionality
  - Success state feedback
  - Customizable icon size
  - Support for nested link elements

- **Number**: Formatted number display

  - Customizable formatting
  - Support for prefixes and suffixes
  - Tooltip integration

- **Global Store**: Central state management
  - Chain data
  - Asset information
  - Contract details
  - Network statistics

### Directory Structure

```
src/
├── app/                  # Next.js 13+ app directory
│   ├── layout.jsx        # Root layout component
│   ├── page.jsx          # Root page component
│   ├── assets/           # Asset-related pages
│   ├── blocks/           # Block explorer pages
│   ├── interchain/       # Interchain functionality pages
│   └── resources/        # Resource pages
│
├── components/           # React components
│   ├── Layout.jsx        # Main layout wrapper
│   ├── Header.jsx        # Navigation header
│   ├── Footer.jsx        # Footer component
│   ├── Overview.jsx      # Dashboard overview
│   ├── GMP.jsx           # General Message Passing components
│   ├── Block.jsx         # Block explorer components
│   ├── Proposal.jsx      # Proposal display components
│   ├── Resources.jsx     # Resource management
│   ├── Global.jsx        # Global state management
│   ├── Copy.jsx          # Copy to clipboard utility
│   ├── Number.jsx        # Number formatting utility
│   ├── Tag.jsx           # Tag/label component
│   ├── Tooltip.jsx       # Tooltip component
│   └── Wallet.jsx        # Wallet integration
│
├── lib/                  # Utility libraries
│   ├── api/              # API integration
│   ├── config/           # Configuration
│   ├── parser/           # Data parsing utilities
│   ├── number/           # Number handling
│   └── string/           # String manipulation
│
├── styles/               # Global styles
│   ├── tailwind.css      # Tailwind CSS entry
│   └── global.css        # Global CSS overrides
```

## 🌟 Run on development environment

To set up a development environment, first specify the required environment variables in the `.env.local` file in the root directory, using other `.env` files as reference. Then run the following command to start the development server:

```bash
npm i
npm run dev
```

## 🌟 Build docker image reference

https://thoughtrealm.medium.com/deploying-a-next-js-app-with-nginx-using-docker-ca6a5bbb902e
