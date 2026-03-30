import "Rounds"

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
