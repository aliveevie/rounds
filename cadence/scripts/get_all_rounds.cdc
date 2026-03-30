import "Rounds"

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
