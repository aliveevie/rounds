import "Rounds"

transaction(roundId: UInt64) {
    let member: Address

    prepare(signer: auth(Storage) &Account) {
        self.member = signer.address
    }

    execute {
        Rounds.joinRound(roundId: roundId, member: self.member)
        log("Joined round: ".concat(roundId.toString()))
    }
}
