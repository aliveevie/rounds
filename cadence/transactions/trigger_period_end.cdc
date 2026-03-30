import "Rounds"

transaction(roundId: UInt64) {
    prepare(signer: auth(Storage) &Account) {
        // Keeper or any account can trigger period end
    }

    execute {
        Rounds.triggerPeriodEnd(roundId: roundId)
        log("Period ended for round: ".concat(roundId.toString()))
    }
}
