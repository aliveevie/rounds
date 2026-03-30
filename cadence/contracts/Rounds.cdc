import "FungibleToken"
import "FlowToken"

access(all) contract Rounds {

    // ── Events ──────────────────────────────────────────────────
    access(all) event RoundCreated(roundId: UInt64, creator: Address, memberCount: UInt8, contributionAmount: UFix64, periodSeconds: UFix64, turnMode: UInt8)
    access(all) event MemberJoined(roundId: UInt64, member: Address, seatIndex: UInt8)
    access(all) event RoundActivated(roundId: UInt64)
    access(all) event ContributionReceived(roundId: UInt64, member: Address, period: UInt8, amount: UFix64)
    access(all) event PeriodCompleted(roundId: UInt64, period: UInt8, recipient: Address, payout: UFix64)
    access(all) event RoundCompleted(roundId: UInt64)
    access(all) event MemberEjected(roundId: UInt64, member: Address, reason: String)
    access(all) event RoundCancelled(roundId: UInt64)

    // ── Enums ───────────────────────────────────────────────────
    access(all) enum RoundState: UInt8 {
        access(all) case PENDING
        access(all) case ACTIVE
        access(all) case DISTRIBUTING
        access(all) case COMPLETE
        access(all) case CANCELLED
    }

    access(all) enum TurnMode: UInt8 {
        access(all) case SEQUENTIAL
        access(all) case RANDOM
    }

    // ── Structs ─────────────────────────────────────────────────
    access(all) struct RoundInfo {
        access(all) let roundId: UInt64
        access(all) let creator: Address
        access(all) let memberCount: UInt8
        access(all) let contributionAmount: UFix64
        access(all) let periodSeconds: UFix64
        access(all) let state: UInt8
        access(all) let currentPeriod: UInt8
        access(all) let members: [Address]
        access(all) let turnOrder: [Address]
        access(all) let turnMode: UInt8
        access(all) let vaultBalance: UFix64
        access(all) let createdAt: UFix64
        access(all) let periodStartTime: UFix64
        access(all) let contributionsThisPeriod: {Address: UFix64}
        access(all) let reputation: {Address: UInt64}

        init(
            roundId: UInt64,
            creator: Address,
            memberCount: UInt8,
            contributionAmount: UFix64,
            periodSeconds: UFix64,
            state: UInt8,
            currentPeriod: UInt8,
            members: [Address],
            turnOrder: [Address],
            turnMode: UInt8,
            vaultBalance: UFix64,
            createdAt: UFix64,
            periodStartTime: UFix64,
            contributionsThisPeriod: {Address: UFix64},
            reputation: {Address: UInt64}
        ) {
            self.roundId = roundId
            self.creator = creator
            self.memberCount = memberCount
            self.contributionAmount = contributionAmount
            self.periodSeconds = periodSeconds
            self.state = state
            self.currentPeriod = currentPeriod
            self.members = members
            self.turnOrder = turnOrder
            self.turnMode = turnMode
            self.vaultBalance = vaultBalance
            self.createdAt = createdAt
            self.periodStartTime = periodStartTime
            self.contributionsThisPeriod = contributionsThisPeriod
            self.reputation = reputation
        }
    }

    // ── Storage Paths ───────────────────────────────────────────
    access(all) let RegistryStoragePath: StoragePath
    access(all) let RegistryPublicPath: PublicPath

    // ── State ───────────────────────────────────────────────────
    access(contract) var nextRoundId: UInt64

    // ── Round Resource ──────────────────────────────────────────
    access(all) resource Round {
        access(all) let roundId: UInt64
        access(all) let creator: Address
        access(all) let memberCount: UInt8
        access(all) let contributionAmount: UFix64
        access(all) let periodSeconds: UFix64
        access(all) let turnMode: TurnMode
        access(all) let createdAt: UFix64

        access(all) var state: RoundState
        access(all) var currentPeriod: UInt8
        access(all) var members: [Address]
        access(all) var turnOrder: [Address]
        access(all) var contributions: {Address: UFix64}
        access(all) var periodStartTime: UFix64
        access(all) var reputation: {Address: UInt64}

        access(self) var vault: @FlowToken.Vault

        init(
            roundId: UInt64,
            creator: Address,
            memberCount: UInt8,
            contributionAmount: UFix64,
            periodSeconds: UFix64,
            turnMode: TurnMode
        ) {
            self.roundId = roundId
            self.creator = creator
            self.memberCount = memberCount
            self.contributionAmount = contributionAmount
            self.periodSeconds = periodSeconds
            self.turnMode = turnMode
            self.createdAt = getCurrentBlock().timestamp

            self.state = RoundState.PENDING
            self.currentPeriod = 0
            self.members = [creator]
            self.turnOrder = []
            self.contributions = {}
            self.periodStartTime = 0.0
            self.reputation = {creator: 0}
            self.vault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()) as! @FlowToken.Vault
        }

        // ── Join ────────────────────────────────────────────
        access(all) fun join(member: Address) {
            pre {
                self.state == RoundState.PENDING: "Round is not accepting members"
                UInt8(self.members.length) < self.memberCount: "Round is full"
                !self.members.contains(member): "Already a member"
            }

            self.members.append(member)
            self.reputation[member] = 0

            emit MemberJoined(
                roundId: self.roundId,
                member: member,
                seatIndex: UInt8(self.members.length - 1)
            )

            // Auto-activate when full
            if UInt8(self.members.length) == self.memberCount {
                self.activate()
            }
        }

        // ── Activate ────────────────────────────────────────
        access(self) fun activate() {
            pre {
                self.state == RoundState.PENDING: "Round must be pending"
                UInt8(self.members.length) == self.memberCount: "Not enough members"
            }

            self.state = RoundState.ACTIVE
            self.periodStartTime = getCurrentBlock().timestamp

            // Assign turn order
            if self.turnMode == TurnMode.RANDOM {
                self.turnOrder = self.shuffleMembers()
            } else {
                self.turnOrder = self.members
            }

            emit RoundActivated(roundId: self.roundId)
        }

        // ── Contribute ──────────────────────────────────────
        access(all) fun contribute(from: @{FungibleToken.Vault}, member: Address) {
            pre {
                self.state == RoundState.ACTIVE: "Round is not active"
                self.members.contains(member): "Not a member"
                self.contributions[member] == nil: "Already contributed this period"
            }

            let amount = from.balance
            assert(
                amount >= self.contributionAmount,
                message: "Insufficient contribution amount. Required: ".concat(self.contributionAmount.toString()).concat(" Got: ").concat(amount.toString())
            )

            self.contributions[member] = amount
            self.vault.deposit(from: <-from)

            emit ContributionReceived(
                roundId: self.roundId,
                member: member,
                period: self.currentPeriod,
                amount: amount
            )
        }

        // ── Trigger Period End (payout) ─────────────────────
        access(all) fun triggerPeriodEnd() {
            pre {
                self.state == RoundState.ACTIVE: "Round is not active"
                UInt8(self.contributions.length) == self.memberCount: "Not all members contributed"
            }

            // Determine recipient for this period
            let recipient = self.turnOrder[self.currentPeriod]

            // Calculate payout: full pot for this period
            let payout = self.contributionAmount * UFix64(self.memberCount)

            // Transfer to recipient
            let recipientAccount = getAccount(recipient)
            let receiverRef = recipientAccount.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                ?? panic("Could not borrow receiver for recipient")

            receiverRef.deposit(from: <-self.vault.withdraw(amount: payout))

            // Update reputation for on-time contributors
            for addr in self.contributions.keys {
                self.reputation[addr] = (self.reputation[addr] ?? 0) + 1
            }

            emit PeriodCompleted(
                roundId: self.roundId,
                period: self.currentPeriod,
                recipient: recipient,
                payout: payout
            )

            // Advance period
            self.currentPeriod = self.currentPeriod + 1
            self.contributions = {} // reset for next period
            self.periodStartTime = getCurrentBlock().timestamp

            // Check if round is complete
            if self.currentPeriod == self.memberCount {
                self.state = RoundState.COMPLETE
                emit RoundCompleted(roundId: self.roundId)
            }
        }

        // ── Cancel (only creator, only if PENDING) ──────────
        access(all) fun cancel(caller: Address) {
            pre {
                self.state == RoundState.PENDING: "Can only cancel pending rounds"
                caller == self.creator: "Only creator can cancel"
            }
            self.state = RoundState.CANCELLED
            emit RoundCancelled(roundId: self.roundId)
        }

        // ── Getters ─────────────────────────────────────────
        access(all) fun getInfo(): RoundInfo {
            return RoundInfo(
                roundId: self.roundId,
                creator: self.creator,
                memberCount: self.memberCount,
                contributionAmount: self.contributionAmount,
                periodSeconds: self.periodSeconds,
                state: self.state.rawValue,
                currentPeriod: self.currentPeriod,
                members: self.members,
                turnOrder: self.turnOrder,
                turnMode: self.turnMode.rawValue,
                vaultBalance: self.vault.balance,
                createdAt: self.createdAt,
                periodStartTime: self.periodStartTime,
                contributionsThisPeriod: self.contributions,
                reputation: self.reputation
            )
        }

        access(all) fun hasContributed(member: Address): Bool {
            return self.contributions[member] != nil
        }

        access(all) fun isPeriodExpired(): Bool {
            if self.periodSeconds == 0.0 { return false }
            return getCurrentBlock().timestamp >= (self.periodStartTime + self.periodSeconds)
        }

        // ── Internal ────────────────────────────────────────
        access(self) fun shuffleMembers(): [Address] {
            let members = self.members
            var shuffled: [Address] = []
            var remaining = members

            // Simple Fisher-Yates using block-based randomness
            var i = remaining.length
            while i > 0 {
                let seed = revertibleRandom<UInt64>()
                let index = Int(seed % UInt64(i))
                shuffled.append(remaining[index])
                remaining.remove(at: index)
                i = i - 1
            }

            return shuffled
        }
    }

    // ── Registry Resource ───────────────────────────────────────
    access(all) resource interface RegistryPublic {
        access(all) fun getRoundInfo(roundId: UInt64): RoundInfo?
        access(all) fun getAllRoundIds(): [UInt64]
        access(all) fun getRoundCount(): Int
    }

    access(all) resource Registry: RegistryPublic {
        access(self) var rounds: @{UInt64: Round}
        access(all) var roundIds: [UInt64]

        init() {
            self.rounds <- {}
            self.roundIds = []
        }

        access(all) fun createRound(
            creator: Address,
            memberCount: UInt8,
            contributionAmount: UFix64,
            periodSeconds: UFix64,
            turnMode: UInt8
        ): UInt64 {
            pre {
                memberCount >= 2: "Need at least 2 members"
                memberCount <= 20: "Maximum 20 members"
                contributionAmount > 0.0: "Contribution must be positive"
            }

            let roundId = Rounds.nextRoundId
            Rounds.nextRoundId = Rounds.nextRoundId + 1

            let mode = turnMode == 0 ? TurnMode.SEQUENTIAL : TurnMode.RANDOM

            let round <- create Round(
                roundId: roundId,
                creator: creator,
                memberCount: memberCount,
                contributionAmount: contributionAmount,
                periodSeconds: periodSeconds,
                turnMode: mode
            )

            self.rounds[roundId] <-! round
            self.roundIds.append(roundId)

            emit RoundCreated(
                roundId: roundId,
                creator: creator,
                memberCount: memberCount,
                contributionAmount: contributionAmount,
                periodSeconds: periodSeconds,
                turnMode: turnMode
            )

            return roundId
        }

        access(all) fun joinRound(roundId: UInt64, member: Address) {
            let roundRef = self.borrowRound(roundId: roundId)
                ?? panic("Round not found")
            roundRef.join(member: member)
        }

        access(all) fun contribute(roundId: UInt64, from: @{FungibleToken.Vault}, member: Address) {
            let roundRef = self.borrowRound(roundId: roundId)
                ?? panic("Round not found")
            roundRef.contribute(from: <-from, member: member)
        }

        access(all) fun triggerPeriodEnd(roundId: UInt64) {
            let roundRef = self.borrowRound(roundId: roundId)
                ?? panic("Round not found")
            roundRef.triggerPeriodEnd()
        }

        access(all) fun cancelRound(roundId: UInt64, caller: Address) {
            let roundRef = self.borrowRound(roundId: roundId)
                ?? panic("Round not found")
            roundRef.cancel(caller: caller)
        }

        // ── Public getters ──────────────────────────────────
        access(all) fun getRoundInfo(roundId: UInt64): RoundInfo? {
            if let roundRef = &self.rounds[roundId] as &Round? {
                return roundRef.getInfo()
            }
            return nil
        }

        access(all) fun getAllRoundIds(): [UInt64] {
            return self.roundIds
        }

        access(all) fun getRoundCount(): Int {
            return self.roundIds.length
        }

        // ── Internal ────────────────────────────────────────
        access(self) fun borrowRound(roundId: UInt64): &Round? {
            return &self.rounds[roundId] as &Round?
        }
    }

    // ── Contract-level public functions (delegate to internal registry) ──

    access(self) fun borrowRegistry(): &Registry {
        return self.account.storage.borrow<&Registry>(from: self.RegistryStoragePath)
            ?? panic("Registry not found")
    }

    access(all) fun createRound(
        creator: Address,
        memberCount: UInt8,
        contributionAmount: UFix64,
        periodSeconds: UFix64,
        turnMode: UInt8
    ): UInt64 {
        let registry = self.borrowRegistry()
        return registry.createRound(
            creator: creator,
            memberCount: memberCount,
            contributionAmount: contributionAmount,
            periodSeconds: periodSeconds,
            turnMode: turnMode
        )
    }

    access(all) fun joinRound(roundId: UInt64, member: Address) {
        let registry = self.borrowRegistry()
        registry.joinRound(roundId: roundId, member: member)
    }

    access(all) fun contribute(roundId: UInt64, from: @{FungibleToken.Vault}, member: Address) {
        let registry = self.borrowRegistry()
        registry.contribute(roundId: roundId, from: <-from, member: member)
    }

    access(all) fun triggerPeriodEnd(roundId: UInt64) {
        let registry = self.borrowRegistry()
        registry.triggerPeriodEnd(roundId: roundId)
    }

    access(all) fun cancelRound(roundId: UInt64, caller: Address) {
        let registry = self.borrowRegistry()
        registry.cancelRound(roundId: roundId, caller: caller)
    }

    access(all) fun getRoundInfo(roundId: UInt64): RoundInfo? {
        let registry = self.account.storage.borrow<&Registry>(from: self.RegistryStoragePath)
            ?? panic("Registry not found")
        return registry.getRoundInfo(roundId: roundId)
    }

    access(all) fun getAllRoundIds(): [UInt64] {
        let registry = self.account.storage.borrow<&Registry>(from: self.RegistryStoragePath)
            ?? panic("Registry not found")
        return registry.getAllRoundIds()
    }

    access(all) fun getRoundCount(): Int {
        let registry = self.account.storage.borrow<&Registry>(from: self.RegistryStoragePath)
            ?? panic("Registry not found")
        return registry.getRoundCount()
    }

    // ── Contract Init ───────────────────────────────────────────
    init() {
        self.nextRoundId = 1
        self.RegistryStoragePath = /storage/RoundsRegistry
        self.RegistryPublicPath = /public/RoundsRegistry

        // Create and store the registry
        let registry <- create Registry()
        self.account.storage.save(<-registry, to: self.RegistryStoragePath)

        // Create public capability
        let cap = self.account.capabilities.storage.issue<&{RegistryPublic}>(self.RegistryStoragePath)
        self.account.capabilities.publish(cap, at: self.RegistryPublicPath)
    }
}
