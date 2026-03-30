"use client";

import Link from "next/link";
import { RoundInfo, STATE_LABELS } from "@/lib/store";

const stateConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "0": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  "1": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400 animate-pulse" },
  "2": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  "3": { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  "4": { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

export default function RoundCard({
  round,
  highlight,
}: {
  round: RoundInfo;
  highlight?: boolean;
}) {
  const memberCount = parseInt(round.memberCount);
  const currentPeriod = parseInt(round.currentPeriod);
  const contributionAmount = parseFloat(round.contributionAmount);
  const potSize = contributionAmount * memberCount;
  const progress =
    round.state === "3" ? 100 : (currentPeriod / memberCount) * 100;
  const membersJoined = round.members.length;
  const sc = stateConfig[round.state] || stateConfig["0"];

  return (
    <Link href={`/round/${round.roundId}`}>
      <div
        className={`group bg-white rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden ${
          highlight
            ? "border-emerald-200 ring-1 ring-emerald-100"
            : "border-gray-100 hover:border-gray-200"
        }`}
      >
        {/* Top accent bar */}
        <div
          className={`h-1 ${
            round.state === "1"
              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
              : round.state === "0"
              ? "bg-gradient-to-r from-amber-300 to-orange-300"
              : round.state === "3"
              ? "bg-gray-200"
              : "bg-red-200"
          }`}
        />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
              Round #{round.roundId}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {STATE_LABELS[round.state] || "Unknown"}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Members
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {membersJoined}
                <span className="text-gray-300">/{memberCount}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Contribution
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {contributionAmount} <span className="text-gray-400 font-normal">FLOW</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Pot Size
              </p>
              <p className="text-sm font-semibold text-emerald-600">
                {potSize} <span className="font-normal">FLOW</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                Period
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {currentPeriod}
                <span className="text-gray-300">/{memberCount}</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {round.state !== "0" && (
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-semibold text-emerald-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Pending CTA */}
          {round.state === "0" && (
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-600 font-medium">
                {memberCount - membersJoined === 0
                  ? "Starting soon..."
                  : `${memberCount - membersJoined} seat${memberCount - membersJoined > 1 ? "s" : ""} left`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
