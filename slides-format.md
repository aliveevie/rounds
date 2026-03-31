# Rounds — Pitch Deck Format (10 Slides)

---

## Slide 1: Title
**Rounds**
Yield-Amplified Rotating Savings on Flow

- Tagline: "Save Together. Earn Together."
- Logo + Flow branding
- Team: IBX Lab
- Hackathon name + date

---

## Slide 2: The Problem
**2.8 billion people use informal savings groups — but they're broken.**

- Susu (West Africa), Chama (East Africa), Tontine (France), Hui (China), Paluwagan (Philippines)
- Trust-dependent: one bad actor ruins it for everyone
- No transparency: who paid? who didn't? where's the money?
- Zero yield: pooled money sits idle between payouts
- No enforcement: missed payments have no consequences
- Stat: "$1 trillion+ cycles through informal savings annually" (World Bank)

---

## Slide 3: The Solution
**Rounds makes rotating savings trustless, transparent, and yield-bearing.**

- Smart contracts enforce contributions and payouts — no trust needed
- On-chain transparency: every contribution and payout is verifiable
- Idle funds earn yield while waiting for payout
- Reputation scoring tracks reliable members
- Works exactly like the savings groups billions already know

---

## Slide 4: How It Works
**3 simple steps — same concept, blockchain-powered.**

- Step 1: Create or join a Round — set members, amount, period
- Step 2: Everyone contributes each period (e.g. 5 FLOW/week)
- Step 3: Full pot goes to one member per period, rotating until everyone receives
- Visual: circular diagram showing N members, arrows rotating, pot in center
- Key point: "If your grandma in Lagos can't use it, it's not done."

---

## Slide 5: Live Demo
**It's live on Flow Testnet right now.**

- Show: Creating a round (2 members, 1 FLOW, random order)
- Show: Joining with a second wallet via invite link
- Show: Both members contributing
- Show: Payout triggered — recipient receives the pot
- Show: Round completes, reputation updated
- Contract address: 0x0109b1ade020b5d7

---

## Slide 6: Architecture
**Built natively on Flow with Cadence resource safety.**

- Smart Contract Layer: Rounds.cdc — Round lifecycle FSM, vault, turn manager, reputation
- Frontend: Next.js + FCL + Tailwind — walletless-ready
- Automation: Keeper service monitors rounds and triggers payouts
- Yield Layer: Adapter interface ready for IncrementFi integration
- Security: Cadence resources prevent fund duplication/loss at compile time
- Diagram: User → FCL → Rounds Contract → FlowToken Vault → Payout

---

## Slide 7: Why Flow
**Flow is the only L1 where this product works for real people.**

- Walletless onboarding: email/passkey signup, no seed phrases
- Sponsored gas: users never pay transaction fees
- Cadence resource model: funds literally cannot be duplicated or lost
- Native randomness beacon: fair, verifiable turn order shuffling
- Consumer-grade UX: designed for non-crypto users from day one
- Comparison: "On Ethereum this costs $50 in gas. On Flow it costs nothing."

---

## Slide 8: Market Opportunity
**A trillion-dollar informal economy waiting to go on-chain.**

- 2.8B people in rotating savings groups globally
- $1T+ annual volume (World Bank estimate)
- Target markets: West Africa, East Africa, Southeast Asia, diaspora communities
- Entry wedge: diaspora remittance groups (cross-border susu)
- Expansion: micro-lending, community treasuries, group investment clubs
- Competitive edge: no existing on-chain solution with real UX for this demographic

---

## Slide 9: Roadmap
**Hackathon is just the beginning.**

- Now (Hackathon): Core contracts, working frontend, testnet deployment, keeper service
- Month 1-2: Security audit, IncrementFi yield integration, push notifications, mainnet launch with pilot communities
- Month 3-6: Mobile app (React Native), cross-border USDC rounds, multi-strategy yield optimizer
- Month 6+: Community-built round templates, protocol governance, Flow RWA integration for higher-yield strategies
- Goal: 10,000 active round participants within 6 months of mainnet

---

## Slide 10: The Ask + Close
**Rounds brings a proven financial primitive on-chain — for the people who need it most.**

- What we built: fully functional protocol on Flow Testnet
- What we need: audit funding, community partnerships, Flow ecosystem support
- The vision: "The world's first trustless rotating savings protocol — making susu, chama, and tontine accessible to billions"
- Call to action: Try it now → [testnet link] | View contract → [Flowscan link]
- Contact / socials / GitHub
