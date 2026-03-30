import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// ─── Configuration ──────────────────────────────────────────
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0109b1ade020b5d7";
const KEEPER_KEY = process.env.KEEPER_PRIVATE_KEY || "";
const KEEPER_ADDRESS = process.env.KEEPER_ADDRESS || "";
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "60000"); // 1 min

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "flow.network": "testnet",
  "0xRounds": CONTRACT_ADDRESS,
});

// ─── Cadence Scripts & Transactions ────────────────────────

const GET_ALL_ROUNDS = `
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

const TRIGGER_PERIOD_END = `
import Rounds from 0xRounds

transaction(roundId: UInt64) {
    prepare(signer: auth(Storage) &Account) {}
    execute {
        Rounds.triggerPeriodEnd(roundId: roundId)
    }
}
`;

// ─── Keeper Logic ──────────────────────────────────────────

async function checkAndTriggerRounds() {
  try {
    const rounds = await fcl.query({ cadence: GET_ALL_ROUNDS });

    if (!rounds || rounds.length === 0) {
      console.log(`[${new Date().toISOString()}] No rounds found.`);
      return;
    }

    for (const round of rounds) {
      const state = round.state;
      const memberCount = parseInt(round.memberCount);
      const contributionsCount = Object.keys(round.contributionsThisPeriod).length;
      const currentPeriod = parseInt(round.currentPeriod);

      // Only process active rounds
      if (state !== "1") continue;

      console.log(
        `[${new Date().toISOString()}] Round #${round.roundId}: ` +
        `period ${currentPeriod}/${memberCount}, ` +
        `contributions: ${contributionsCount}/${memberCount}`
      );

      // If all members have contributed, trigger period end
      if (contributionsCount === memberCount) {
        console.log(`  -> All contributed! Triggering period end...`);
        try {
          if (KEEPER_KEY && KEEPER_ADDRESS) {
            // If keeper credentials are set, sign and send transaction
            const authz = buildAuthorization(KEEPER_ADDRESS, KEEPER_KEY);
            const txId = await fcl.mutate({
              cadence: TRIGGER_PERIOD_END,
              args: (arg) => [arg(parseInt(round.roundId), t.UInt64)],
              proposer: authz,
              payer: authz,
              authorizations: [authz],
              limit: 999,
            });
            const result = await fcl.tx(txId).onceSealed();
            console.log(`  -> Period end triggered! TX: ${txId}`);
          } else {
            console.log(`  -> [DRY RUN] Would trigger period end for round #${round.roundId}`);
          }
        } catch (err) {
          console.error(`  -> Error triggering period end:`, err.message || err);
        }
      }

      // Check for expired periods (missed contributions)
      const periodSeconds = parseFloat(round.periodSeconds);
      const periodStartTime = parseFloat(round.periodStartTime);
      const now = Date.now() / 1000;

      if (periodSeconds > 0 && now > periodStartTime + periodSeconds) {
        const overdue = Math.round(now - (periodStartTime + periodSeconds));
        console.log(`  -> Period overdue by ${overdue}s. Missing ${memberCount - contributionsCount} contributions.`);
      }
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error polling rounds:`, err.message || err);
  }
}

function buildAuthorization(address, privateKey) {
  return async (account) => {
    const { ec } = await import("@onflow/fcl");
    return {
      ...account,
      tempId: `${address}-0`,
      addr: fcl.sansPrefix(address),
      keyId: 0,
      signingFunction: async (signable) => {
        return {
          addr: fcl.sansPrefix(address),
          keyId: 0,
          signature: "", // Placeholder - real implementation needs crypto signing
        };
      },
    };
  };
}

// ─── Main Loop ─────────────────────────────────────────────

console.log("=== Rounds Keeper Service ===");
console.log(`Contract: ${CONTRACT_ADDRESS}`);
console.log(`Poll interval: ${POLL_INTERVAL_MS}ms`);
console.log(`Keeper address: ${KEEPER_ADDRESS || "(dry-run mode)"}`);
console.log("");

// Initial check
checkAndTriggerRounds();

// Set up polling interval
setInterval(checkAndTriggerRounds, POLL_INTERVAL_MS);

console.log("Keeper is running. Press Ctrl+C to stop.");
