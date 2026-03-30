"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import "@/lib/flow-config";
import { useStore, RoundInfo, STATE_LABELS } from "@/lib/store";
import {
  GET_ROUND_INFO,
  JOIN_ROUND,
  CONTRIBUTE,
  TRIGGER_PERIOD_END,
  CANCEL_ROUND,
} from "@/lib/cadence";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  );
}

export default function RoundDetailPage() {
  const params = useParams();
  const roundId = params.id as string;
  const { user } = useStore();
  const [round, setRound] = useState<RoundInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [copied, setCopied] = useState(false);
  const [txStatus, setTxStatus] = useState("");

  const fetchRound = useCallback(async () => {
    try {
      const result = (await fcl.query({
        cadence: GET_ROUND_INFO,
        args: (arg: typeof fcl.arg) => [arg(parseInt(roundId), t.UInt64)],
      })) as RoundInfo | null;
      setRound(result);
    } catch (err) {
      console.error("Fetch round error:", err);
    } finally {
      setLoading(false);
    }
  }, [roundId]);

  useEffect(() => {
    fetchRound();
    const interval = setInterval(fetchRound, 10000);
    return () => clearInterval(interval);
  }, [fetchRound]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/round/${roundId}`
      : "";

  const shareText = round
    ? `Join my savings round on Rounds! ${parseInt(round.memberCount)} members, ${parseFloat(round.contributionAmount)} FLOW each period. Save together, earn together.`
    : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
      "_blank"
    );
  };

  const shareTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const runTx = async (
    label: string,
    fn: () => Promise<string>
  ) => {
    setActionLoading(label);
    setTxStatus("Waiting for approval...");
    try {
      const txId = await fn();
      setTxStatus("Confirming on-chain...");
      await fcl.tx(txId).onceSealed();
      setTxStatus("Done!");
      setTimeout(() => setTxStatus(""), 2000);
      fetchRound();
    } catch (err) {
      console.error(`${label} error:`, err);
      setTxStatus("Transaction failed. Please try again.");
      setTimeout(() => setTxStatus(""), 3000);
    } finally {
      setActionLoading("");
    }
  };

  const handleJoin = () =>
    runTx("join", () =>
      fcl.mutate({
        cadence: JOIN_ROUND,
        args: (arg: typeof fcl.arg) => [arg(parseInt(roundId), t.UInt64)],
        limit: 999,
      })
    );

  const handleContribute = () =>
    runTx("contribute", () =>
      fcl.mutate({
        cadence: CONTRIBUTE,
        args: (arg: typeof fcl.arg) => [
          arg(parseInt(roundId), t.UInt64),
          arg(parseFloat(round!.contributionAmount).toFixed(8), t.UFix64),
        ],
        limit: 999,
      })
    );

  const handleTriggerPeriodEnd = () =>
    runTx("trigger", () =>
      fcl.mutate({
        cadence: TRIGGER_PERIOD_END,
        args: (arg: typeof fcl.arg) => [arg(parseInt(roundId), t.UInt64)],
        limit: 999,
      })
    );

  const handleCancel = () =>
    runTx("cancel", () =>
      fcl.mutate({
        cadence: CANCEL_ROUND,
        args: (arg: typeof fcl.arg) => [arg(parseInt(roundId), t.UInt64)],
        limit: 999,
      })
    );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading round...</p>
          </div>
        </div>
      </>
    );
  }

  if (!round) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">404</div>
            <p className="text-gray-500 mb-4">Round not found</p>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const memberCount = parseInt(round.memberCount);
  const currentPeriod = parseInt(round.currentPeriod);
  const contributionAmount = parseFloat(round.contributionAmount);
  const potSize = contributionAmount * memberCount;
  const progress = round.state === "3" ? 100 : (currentPeriod / memberCount) * 100;
  const isMember = user?.addr ? round.members.includes(user.addr) : false;
  const hasContributed = user?.addr
    ? round.contributionsThisPeriod[user.addr] !== undefined
    : false;
  const contributionsIn = Object.keys(round.contributionsThisPeriod).length;
  const allContributed = contributionsIn === memberCount;
  const currentRecipient =
    round.turnOrder.length > 0 ? round.turnOrder[currentPeriod] : null;
  const isCreator = user?.addr === round.creator;
  const isComplete = round.state === "3";
  const isCancelled = round.state === "4";
  const isPending = round.state === "0";
  const isActive = round.state === "1";

  const stateConfig: Record<string, { bg: string; text: string; dot: string }> = {
    "0": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    "1": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400 animate-pulse" },
    "3": { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
    "4": { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  };
  const sc = stateConfig[round.state] || stateConfig["0"];

  return (
    <>
      <Navbar />

      {/* Gradient header band */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-32" />

      <main className="max-w-3xl mx-auto px-4 -mt-16 pb-12 w-full">
        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top section */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-1">
              <Link
                href="/"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                &larr; All Rounds
              </Link>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
              >
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                {STATE_LABELS[round.state]}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Round #{round.roundId}
            </h1>
            <p className="text-sm text-gray-400 font-mono mt-0.5">
              by {round.creator}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 border-t border-b border-gray-100">
            {[
              {
                value: `${round.members.length}/${memberCount}`,
                label: "Members",
                icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
                ),
              },
              {
                value: `${contributionAmount}`,
                label: "FLOW / period",
                icon: (
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ),
              },
              {
                value: `${potSize}`,
                label: "FLOW pot",
                icon: (
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>
                ),
              },
              {
                value: `${currentPeriod}/${memberCount}`,
                label: "Period",
                icon: (
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ),
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-4 text-center ${i < 3 ? "border-r border-gray-100" : ""}`}
              >
                <div className="flex justify-center mb-1.5">{stat.icon}</div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {!isPending && (
            <div className="px-6 pt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Round progress</span>
                <span className="font-semibold text-emerald-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* TX Status toast */}
          {txStatus && (
            <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-xl flex items-center gap-2">
              {actionLoading && (
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              )}
              {txStatus}
            </div>
          )}

          {/* ── Actions section ── */}
          <div className="p-6 space-y-3">
            {!user?.loggedIn && (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm mb-3">
                  Connect your wallet to participate
                </p>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 text-sm font-semibold rounded-xl"
                  onClick={fcl.authenticate}
                >
                  Connect Wallet
                </Button>
              </div>
            )}

            {user?.loggedIn && isPending && !isMember && (
              <Button
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-200"
                onClick={handleJoin}
                disabled={!!actionLoading}
              >
                {actionLoading === "join" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  "Join This Round"
                )}
              </Button>
            )}

            {user?.loggedIn && isPending && isMember && (
              <div className="text-center py-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-2xl mb-1">
                  {memberCount - round.members.length === 0 ? "🎉" : "⏳"}
                </div>
                <p className="text-amber-700 font-medium text-sm">
                  Waiting for {memberCount - round.members.length} more member
                  {memberCount - round.members.length !== 1 ? "s" : ""} to join
                </p>
                <p className="text-amber-500 text-xs mt-1">
                  Share the invite link below!
                </p>
              </div>
            )}

            {user?.loggedIn && isActive && isMember && !hasContributed && (
              <Button
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-200"
                onClick={handleContribute}
                disabled={!!actionLoading}
              >
                {actionLoading === "contribute" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Contributing...
                  </span>
                ) : (
                  `Contribute ${contributionAmount} FLOW`
                )}
              </Button>
            )}

            {user?.loggedIn && isActive && hasContributed && (
              <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-emerald-700 font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Contributed this period
                </p>
                <p className="text-emerald-500 text-xs mt-0.5">
                  {contributionsIn}/{memberCount} members have contributed
                </p>
              </div>
            )}

            {user?.loggedIn && isActive && allContributed && (
              <Button
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                onClick={handleTriggerPeriodEnd}
                disabled={!!actionLoading}
              >
                {actionLoading === "trigger" ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing payout...
                  </span>
                ) : (
                  `Trigger Payout to ${currentRecipient?.slice(0, 6)}...${currentRecipient?.slice(-4)}`
                )}
              </Button>
            )}

            {isComplete && (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-gray-700 font-semibold">Round Complete!</p>
                <p className="text-gray-400 text-sm mt-1">
                  All members received their payouts.
                </p>
                <Link href="/">
                  <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                    Start a New Round
                  </Button>
                </Link>
              </div>
            )}

            {isCancelled && (
              <div className="text-center py-6 bg-red-50 rounded-xl">
                <p className="text-red-600 font-semibold">
                  This round was cancelled.
                </p>
              </div>
            )}

            {user?.loggedIn && isPending && isCreator && (
              <Button
                variant="outline"
                className="w-full h-10 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm"
                onClick={handleCancel}
                disabled={!!actionLoading}
              >
                {actionLoading === "cancel" ? "Cancelling..." : "Cancel Round"}
              </Button>
            )}
          </div>

          {/* ── Contributions this period ── */}
          {isActive && (
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>
                  Period {currentPeriod + 1} Contributions
                  <span className="ml-auto text-xs font-normal text-gray-400">
                    {contributionsIn}/{memberCount}
                  </span>
                </h3>
                <div className="space-y-2">
                  {round.members.map((addr) => {
                    const contributed =
                      round.contributionsThisPeriod[addr] !== undefined;
                    const isYou = addr === user?.addr;
                    const isRecipient = addr === currentRecipient;
                    return (
                      <div
                        key={addr}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          isYou ? "bg-white border border-emerald-100" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              contributed
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {contributed ? "✓" : "?"}
                          </div>
                          <div>
                            <span className="font-mono text-xs text-gray-700">
                              {addr.slice(0, 6)}...{addr.slice(-4)}
                            </span>
                            <div className="flex gap-1 mt-0.5">
                              {isYou && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
                                  You
                                </span>
                              )}
                              {isRecipient && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                  Recipient
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            contributed
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {contributed ? "Paid" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Turn order ── */}
          {round.turnOrder.length > 0 && (
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"/></svg>
                  Payout Order
                  <span className="ml-auto text-[10px] font-normal bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {round.turnMode === "1" ? "Randomized" : "Sequential"}
                  </span>
                </h3>
                <div className="space-y-1.5">
                  {round.turnOrder.map((addr, i) => {
                    const received = i < currentPeriod;
                    const isCurrent = i === currentPeriod && isActive;
                    const isYou = addr === user?.addr;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                          isCurrent ? "bg-blue-50 border border-blue-100" : ""
                        } ${received ? "opacity-60" : ""}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            received
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {received ? "✓" : i + 1}
                        </div>
                        <span className="font-mono text-xs text-gray-600 flex-1">
                          {addr.slice(0, 6)}...{addr.slice(-4)}
                          {isYou && (
                            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            received
                              ? "text-emerald-500"
                              : isCurrent
                              ? "text-blue-500"
                              : "text-gray-300"
                          }`}
                        >
                          {received
                            ? `${potSize} FLOW received`
                            : isCurrent
                            ? "Current recipient"
                            : `Period ${i + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Members & Reputation ── */}
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
                Members & Reputation
              </h3>
              <div className="space-y-1.5">
                {round.members.map((addr) => {
                  const isYou = addr === user?.addr;
                  const rep = parseInt(round.reputation[addr] || "0");
                  return (
                    <div
                      key={addr}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        isYou ? "bg-white border border-gray-200" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {addr.slice(2, 4).toUpperCase()}
                        </div>
                        <span className="font-mono text-xs text-gray-700">
                          {addr.slice(0, 6)}...{addr.slice(-4)}
                          {isYou && (
                            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">
                              You
                            </span>
                          )}
                          {addr === round.creator && (
                            <span className="ml-1 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                              Creator
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(rep, 5) }).map(
                          (_, i) => (
                            <svg
                              key={i}
                              className="w-3.5 h-3.5 text-amber-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          )
                        )}
                        <span className="text-xs text-gray-400 ml-1">
                          {rep}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Share / Invite section ── */}
          {(isPending || isActive) && (
            <div className="px-6 pb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-1 text-center">
                  {isPending ? "Invite Members" : "Share This Round"}
                </h3>
                <p className="text-xs text-gray-400 text-center mb-4">
                  {isPending
                    ? `Need ${memberCount - round.members.length} more to start`
                    : "Invite friends to your next round"}
                </p>

                {/* Share buttons */}
                <div className="flex gap-2 justify-center mb-4">
                  <button
                    onClick={shareWhatsApp}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </button>
                  <button
                    onClick={shareTelegram}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    <TelegramIcon />
                    Telegram
                  </button>
                  <button
                    onClick={shareTwitter}
                    className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    <XIcon />
                    Post
                  </button>
                </div>

                {/* Copy link */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-500 truncate">
                    {shareUrl}
                  </div>
                  <button
                    onClick={copyLink}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      copied
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contract link */}
        <div className="text-center mt-6">
          <a
            href={`https://testnet.flowscan.io/account/0x0109b1ade020b5d7`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-emerald-600 transition-colors"
          >
            View contract on Flowscan &rarr;
          </a>
        </div>
      </main>
    </>
  );
}
