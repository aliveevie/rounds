export const CREATE_ROUND = `
import Rounds from 0xRounds

transaction(
    memberCount: UInt8,
    contributionAmount: UFix64,
    periodSeconds: UFix64,
    turnMode: UInt8
) {
    let creator: Address

    prepare(signer: auth(Storage) &Account) {
        self.creator = signer.address
    }

    execute {
        let roundId = Rounds.createRound(
            creator: self.creator,
            memberCount: memberCount,
            contributionAmount: contributionAmount,
            periodSeconds: periodSeconds,
            turnMode: turnMode
        )
        log("Round created with ID: ".concat(roundId.toString()))
    }
}
`;

export const JOIN_ROUND = `
import Rounds from 0xRounds

transaction(roundId: UInt64) {
    let member: Address

    prepare(signer: auth(Storage) &Account) {
        self.member = signer.address
    }

    execute {
        Rounds.joinRound(roundId: roundId, member: self.member)
    }
}
`;

export const CONTRIBUTE = `
import Rounds from 0xRounds
import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

transaction(roundId: UInt64, amount: UFix64) {
    let payment: @{FungibleToken.Vault}
    let member: Address

    prepare(signer: auth(Storage, BorrowValue) &Account) {
        self.member = signer.address

        let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow FlowToken vault")

        self.payment <- vaultRef.withdraw(amount: amount)
    }

    execute {
        Rounds.contribute(roundId: roundId, from: <-self.payment, member: self.member)
    }
}
`;

export const TRIGGER_PERIOD_END = `
import Rounds from 0xRounds

transaction(roundId: UInt64) {
    prepare(signer: auth(Storage) &Account) {}

    execute {
        Rounds.triggerPeriodEnd(roundId: roundId)
    }
}
`;

export const CANCEL_ROUND = `
import Rounds from 0xRounds

transaction(roundId: UInt64) {
    let caller: Address

    prepare(signer: auth(Storage) &Account) {
        self.caller = signer.address
    }

    execute {
        Rounds.cancelRound(roundId: roundId, caller: self.caller)
    }
}
`;

export const GET_ALL_ROUNDS = `
import Rounds from 0xRounds

access(all) fun main(): [Rounds.RoundInfo] {
    let roundIds = Rounds.getAllRoundIds()
    var rounds: [Rounds.RoundInfo] = []
    for id in roundIds {
        if let info = Rounds.getRoundInfo(roundId: id) {
            rounds.append(info)
        }
    }
    return rounds
}
`;

export const GET_ROUND_INFO = `
import Rounds from 0xRounds

access(all) fun main(roundId: UInt64): Rounds.RoundInfo? {
    return Rounds.getRoundInfo(roundId: roundId)
}
`;

export const GET_ROUND_COUNT = `
import Rounds from 0xRounds

access(all) fun main(): Int {
    return Rounds.getRoundCount()
}
`;
