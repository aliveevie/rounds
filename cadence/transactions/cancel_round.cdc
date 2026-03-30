import "Rounds"

transaction(roundId: UInt64) {
    let caller: Address

    prepare(signer: auth(Storage) &Account) {
        self.caller = signer.address
    }

    execute {
        Rounds.cancelRound(roundId: roundId, caller: self.caller)
        log("Cancelled round: ".concat(roundId.toString()))
    }
}
