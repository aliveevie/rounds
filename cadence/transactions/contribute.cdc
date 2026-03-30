import "Rounds"
import "FungibleToken"
import "FlowToken"

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
        log("Contributed to round: ".concat(roundId.toString()))
    }
}
