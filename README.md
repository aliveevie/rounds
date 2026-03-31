<p align="center">
  <img src="https://img.shields.io/badge/Flow-Testnet-00EF8B?style=for-the-badge&logo=flow&logoColor=white" alt="Flow Testnet" />
  <img src="https://img.shields.io/badge/Cadence-1.0-purple?style=for-the-badge" alt="Cadence 1.0" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" alt="Live" />
</p>

<h1 align="center">
  <br />
  Rounds
  <br />
  <sub>Yield-Amplified Rotating Savings on Flow</sub>
</h1>

<p align="center">
  <strong>Save Together. Earn Together.</strong>
  <br />
  The world's first trustless rotating savings protocol — bringing susu, chama, and tontine on-chain for billions.
</p>

<p align="center">
  <a href="https://rounds.ibxlab.com/"><strong>Live App</strong></a> &nbsp;&bull;&nbsp;
  <a href="https://youtu.be/7iSH1Gk1s7w"><strong>Demo Video</strong></a> &nbsp;&bull;&nbsp;
  <a href="https://testnet.flowscan.io/account/0x0109b1ade020b5d7"><strong>View Contract</strong></a> &nbsp;&bull;&nbsp;
  <a href="https://github.com/aliveevie/rounds"><strong>Source Code</strong></a>
</p>

---

## The Problem

**2.8 billion people** rely on informal rotating savings groups every day — and **$1 trillion+** cycles through them annually (World Bank).

They go by many names:

| Region | Name |
|---|---|
| West Africa | Susu / Ajo / Esusu |
| East Africa | Chama |
| France / North Africa | Tontine |
| China | Hui |
| Philippines | Paluwagan |
| Caribbean | Sou-Sou |

Yet they all share the same crippling problems:

- **Trust-dependent** — one bad actor ruins it for everyone
- **Zero transparency** — who paid? who didn't? where's the money?
- **No yield** — pooled funds sit idle between payouts
- **No enforcement** — missed payments have no consequences
- **No record** — reliable savers have nothing to show for it

---

## The Solution

**Rounds** brings rotating savings on-chain — making them **trustless, transparent, and yield-bearing**.

- Smart contracts enforce every contribution and payout automatically
- Every transaction is verifiable on-chain — full transparency
- Idle funds can earn yield while waiting for distribution
- On-chain reputation scoring rewards reliable participants
- Works exactly like the savings groups billions already know and trust

> *"If your grandma in Lagos can't use it, it's not done."*

---

## How It Works

```
   Create          Contribute         Receive
  a Round     -->  Each Period   -->  Your Pot
     |                 |                 |
 Set members,     Everyone puts      When it's your
 amount, and      in the same        turn, you get
 period length    amount on-chain    the full pot
```

1. **Create or Join** a Round — set the number of members, contribution amount, and period length
2. **Contribute** each period — everyone deposits the same amount (e.g., 5 FLOW/week)
3. **Receive** the full pot when it's your turn — rotating until every member has been paid out

All enforced by smart contracts. No middlemen. No trust required.

---

## Live Demo

**Try it now:** [https://rounds.ibxlab.com](https://rounds.ibxlab.com/)

**Watch the walkthrough:** [https://youtu.be/7iSH1Gk1s7w](https://youtu.be/7iSH1Gk1s7w)

The demo shows:
- Creating a round with configurable members, amount, and period
- Joining via invite link
- Contributing FLOW tokens each period
- Automatic payout to the recipient
- Reputation tracking after round completion

---

## Smart Contract

| | |
|---|---|
| **Network** | Flow Testnet |
| **Contract Address** | [`0x0109b1ade020b5d7`](https://testnet.flowscan.io/account/0x0109b1ade020b5d7) |
| **Language** | Cadence 1.0 |
| **Contract** | `Rounds.cdc` |

### Round Lifecycle

```
PENDING  -->  ACTIVE  -->  DISTRIBUTING  -->  COMPLETE
   |                                             |
   +----->  CANCELLED  <-------------------------+
```

### Key Features

- **Finite State Machine** — rounds progress through well-defined states
- **FlowToken Vault** — funds are held securely in a Cadence resource vault
- **Turn Manager** — supports both sequential and on-chain random (VRF) payout order
- **Reputation System** — tracks on-time contributions per member across all rounds
- **Resource Safety** — Cadence guarantees funds cannot be duplicated or lost at compile time

---

## Architecture

```
+------------------+     +-------------------+     +------------------+
|    Frontend      |     |  Smart Contract   |     |    Keeper        |
|  Next.js + FCL   |---->|   Rounds.cdc      |<----|  Node.js Cron    |
|  Tailwind CSS    |     |  Flow Testnet     |     |  Auto-trigger    |
+------------------+     +-------------------+     +------------------+
        |                        |
        v                        v
  User Wallet             FlowToken Vault
  (FCL Discovery)         (Secure Payouts)
```

| Layer | Technology |
|---|---|
| Smart Contracts | Cadence 1.0 on Flow |
| Frontend | Next.js 16 + FCL + Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Wallet Connection | FCL Discovery + WalletConnect |
| Automation | Node.js keeper service |
| Yield (Planned) | IncrementFi adapter interface |

---

## Why Flow

Flow is the **only L1** where this product works for real people:

- **Walletless onboarding** — email/passkey signup, no seed phrases
- **Sponsored gas** — users never pay transaction fees
- **Cadence resource model** — funds literally cannot be duplicated or lost
- **Native randomness beacon** — fair, verifiable turn order shuffling
- **Consumer-grade UX** — designed for non-crypto users from day one

> *On Ethereum, a single round contribution costs ~$50 in gas. On Flow, it costs nothing.*

---

## Getting Started

### Prerequisites

- Node.js 18+
- Flow CLI v2+

### Run Locally

```bash
# Clone the repository
git clone https://github.com/aliveevie/rounds.git
cd rounds

# Install frontend dependencies
cd frontend
npm install

# Configure environment
# Update src/lib/flow-config.ts with your settings

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy Contracts

```bash
# Install Flow CLI
brew install flow-cli

# Deploy to testnet
flow deploy --network=testnet
```

---

## Market Opportunity

| Metric | Value |
|---|---|
| People in rotating savings groups | **2.8 billion** |
| Annual volume | **$1 trillion+** |
| Target markets | West Africa, East Africa, Southeast Asia, Diaspora |
| On-chain competitors with real UX | **Zero** |

**Entry wedge:** Diaspora remittance groups (cross-border susu)

**Expansion:** Micro-lending, community treasuries, group investment clubs

---

## Roadmap

| Phase | Milestones |
|---|---|
| **Now** (Hackathon) | Core contracts, working frontend, testnet deployment, keeper service |
| **Month 1-2** | Security audit, IncrementFi yield integration, push notifications, mainnet launch |
| **Month 3-6** | Mobile app (React Native), cross-border USDC rounds, multi-strategy yield |
| **Month 6+** | Community templates, protocol governance, Flow RWA integration |

**Goal:** 10,000 active round participants within 6 months of mainnet.

---

## Project Structure

```
rounds/
  cadence/
    contracts/
      Rounds.cdc            # Main protocol contract
    transactions/
      create_round.cdc      # Create a new round
      join_round.cdc        # Join an existing round
      contribute.cdc        # Make a contribution
      trigger_period_end.cdc # Trigger payout
      cancel_round.cdc      # Cancel a round
    scripts/
      get_all_rounds.cdc    # Query all rounds
      get_round_info.cdc    # Query single round
      get_round_count.cdc   # Get total count
  frontend/
    src/
      app/                  # Next.js pages
      components/           # UI components
      lib/                  # FCL config, Cadence strings, store
  keeper/
    index.js                # Automation service
  flow.json                 # Flow project configuration
```

---

## Team

**IBX Lab**

Building accessible financial infrastructure for the next billion users.

---

<p align="center">
  <a href="https://rounds.ibxlab.com/">Live App</a> &nbsp;&bull;&nbsp;
  <a href="https://youtu.be/7iSH1Gk1s7w">Demo Video</a> &nbsp;&bull;&nbsp;
  <a href="https://testnet.flowscan.io/account/0x0109b1ade020b5d7">Smart Contract</a> &nbsp;&bull;&nbsp;
  <a href="https://github.com/aliveevie/rounds">GitHub</a>
</p>

<p align="center">
  <sub>Built with Cadence on Flow &mdash; Save Together. Earn Together.</sub>
</p>
