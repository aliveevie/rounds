"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CREATE_ROUND } from "@/lib/cadence";

export default function CreateRoundDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [memberCount, setMemberCount] = useState("3");
  const [contributionAmount, setContributionAmount] = useState("1.0");
  const [periodDays, setPeriodDays] = useState("7");
  const [turnMode, setTurnMode] = useState("1");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const potSize = (
    parseFloat(contributionAmount || "0") * parseInt(memberCount || "0")
  ).toFixed(2);

  const handleCreate = async () => {
    setLoading(true);
    setStatus("Waiting for wallet approval...");
    try {
      const periodSeconds = (parseFloat(periodDays) * 86400).toFixed(8);
      const amount = parseFloat(contributionAmount).toFixed(8);

      const txId = await fcl.mutate({
        cadence: CREATE_ROUND,
        args: (arg: typeof fcl.arg) => [
          arg(parseInt(memberCount), t.UInt8),
          arg(amount, t.UFix64),
          arg(periodSeconds, t.UFix64),
          arg(parseInt(turnMode), t.UInt8),
        ],
        limit: 999,
      });

      setStatus("Confirming on-chain...");
      await fcl.tx(txId).onceSealed();
      setStatus("");
      setOpen(false);
      onCreated();
    } catch (err) {
      console.error("Create round error:", err);
      setStatus("Failed to create. Please try again.");
      setTimeout(() => setStatus(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-white/90 font-semibold h-12 px-6 rounded-xl text-base shadow-lg cursor-pointer transition-all hover:shadow-xl">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
        Start a Round
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Create a New Round
            </DialogTitle>
          </DialogHeader>
          <p className="text-emerald-100 text-sm mt-1">
            Set up your rotating savings group
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Members */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Number of Members
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setMemberCount(String(Math.max(2, parseInt(memberCount) - 1)))
                }
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer text-lg font-medium"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-gray-900">
                  {memberCount}
                </span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  members
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMemberCount(
                    String(Math.min(20, parseInt(memberCount) + 1))
                  )
                }
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Contribution */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Contribution per Period
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                step="0.5"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="w-full h-11 border border-gray-200 rounded-xl px-4 pr-16 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                FLOW
              </span>
            </div>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Period Length
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["1", "3", "7", "14"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setPeriodDays(d)}
                  className={`h-10 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    periodDays === d
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Custom:</span>
              <input
                type="number"
                min="0.001"
                step="1"
                value={periodDays}
                onChange={(e) => setPeriodDays(e.target.value)}
                className="w-20 h-8 border border-gray-200 rounded-lg px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-gray-400">days</span>
            </div>
          </div>

          {/* Turn mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Payout Order
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTurnMode("0")}
                className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                  turnMode === "0"
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"/></svg>
                  <span className="text-sm font-semibold text-gray-800">
                    Sequential
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  First-come, first-served
                </p>
              </button>
              <button
                type="button"
                onClick={() => setTurnMode("1")}
                className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                  turnMode === "1"
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"/></svg>
                  <span className="text-sm font-semibold text-gray-800">
                    Random
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">On-chain VRF shuffle</p>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50/50 rounded-xl p-4 border border-gray-100">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-emerald-600">{potSize}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  FLOW / pot
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {memberCount}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  periods
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  {(parseFloat(periodDays) * parseInt(memberCount)).toFixed(0)}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  total days
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          {status && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100">
              {loading && (
                <span className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              )}
              {status}
            </div>
          )}

          {/* Submit */}
          <button
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Round"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
