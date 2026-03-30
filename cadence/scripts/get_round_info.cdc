import "Rounds"

access(all) fun main(roundId: UInt64): Rounds.RoundInfo? {
    return Rounds.getRoundInfo(roundId: roundId)
}
