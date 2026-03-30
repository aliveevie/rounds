"use client";

import { useEffect, useCallback } from "react";
import * as fcl from "@onflow/fcl";
import "@/lib/flow-config";
import { useStore, RoundInfo } from "@/lib/store";
import { GET_ALL_ROUNDS } from "@/lib/cadence";
import Navbar from "@/components/Navbar";
import RoundCard from "@/components/RoundCard";
import CreateRoundDialog from "@/components/CreateRoundDialog";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, rounds, loading, setRounds, setLoading } = useStore();

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await fcl.query({
        cadence: GET_ALL_ROUNDS,
      })) as RoundInfo[];
      setRounds(result || []);
    } catch (err) {
      console.error("Fetch rounds error:", err);
    } finally {
      setLoading(false);
    }
  }, [setRounds, setLoading]);

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 15000);
    return () => clearInterval(interval);
  }, [fetchRounds]);

  const activeRounds = rounds.filter((r) => r.state === "1");
  const pendingRounds = rounds.filter((r) => r.state === "0");
  const completedRounds = rounds.filter(
    (r) => r.state === "3" || r.state === "4"
  );

  // Rounds current user is part of
  const myRounds = rounds.filter(
    (r) => user?.addr && r.members.includes(user.addr)
  );

  return (
    <>
      <Navbar />

      {/* Hero with gradient */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnptMCAzMHY2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="max-w-5xl mx-auto px-4 py-16 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm mb-6">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              Live on Flow Testnet
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Save Together.
              <br />
              Earn Together.
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Trustless rotating savings groups (susu, chama, tontine) powered
              by Flow. No banks, no middlemen, no trust required.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {user?.loggedIn ? (
                <CreateRoundDialog onCreated={fetchRounds} />
              ) : (
                <Button
                  className="h-12 px-6 bg-white text-emerald-700 hover:bg-white/90 font-semibold rounded-xl text-base shadow-lg"
                  onClick={fcl.authenticate}
                >
                  Connect Wallet to Start
                </Button>
              )}
              <Button
                variant="outline"
                className="h-12 px-6 bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-xl text-base"
                onClick={fetchRounds}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-8 mb-10 relative z-10">
          {[
            {
              step: "1",
              title: "Create or Join",
              desc: "Start a round with friends or join an open one. Set contribution amount and period.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>
              ),
            },
            {
              step: "2",
              title: "Contribute Each Period",
              desc: "Everyone puts in the same amount each period. Funds are held securely on-chain.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ),
            },
            {
              step: "3",
              title: "Receive Your Pot",
              desc: "When it's your turn, you receive the full pot. Everyone gets a payout by the end.",
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { value: rounds.length, label: "Total Rounds", color: "text-gray-900" },
            { value: activeRounds.length, label: "Active", color: "text-emerald-600" },
            { value: pendingRounds.length, label: "Open to Join", color: "text-amber-600" },
            { value: completedRounds.length, label: "Completed", color: "text-gray-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 text-center border border-gray-100"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My Rounds */}
        {myRounds.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              My Rounds
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myRounds.map((r) => (
                <RoundCard key={r.roundId} round={r} highlight />
              ))}
            </div>
          </section>
        )}

        {/* Pending Rounds */}
        {pendingRounds.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Open Rounds — Join Now
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRounds.map((r) => (
                <RoundCard key={r.roundId} round={r} />
              ))}
            </div>
          </section>
        )}

        {/* Active Rounds */}
        {activeRounds.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Active Rounds
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRounds.map((r) => (
                <RoundCard key={r.roundId} round={r} />
              ))}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedRounds.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Completed Rounds
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedRounds.map((r) => (
                <RoundCard key={r.roundId} round={r} />
              ))}
            </div>
          </section>
        )}

        {rounds.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌍</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              No rounds yet
            </p>
            <p className="text-gray-400 mb-6">
              Be the first to start a savings round!
            </p>
            {user?.loggedIn ? (
              <CreateRoundDialog onCreated={fetchRounds} />
            ) : (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 rounded-xl"
                onClick={fcl.authenticate}
              >
                Connect Wallet to Start
              </Button>
            )}
          </div>
        )}
      </main>

      <footer className="border-t bg-white py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              R
            </div>
            <span className="font-bold text-gray-700">Rounds</span>
          </div>
          <p className="text-sm text-gray-400 mb-2">
            Yield-amplified rotating savings on Flow
          </p>
          <a
            href="https://testnet.flowscan.io/account/0x0109b1ade020b5d7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-600 hover:underline"
          >
            View Contract on Flowscan &rarr;
          </a>
        </div>
      </footer>
    </>
  );
}
