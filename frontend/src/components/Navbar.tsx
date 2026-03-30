"use client";

import * as fcl from "@onflow/fcl";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function Navbar() {
  const { user, setUser } = useStore();

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, [setUser]);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
            R
          </div>
          <span className="text-lg font-bold text-gray-900">Rounds</span>
        </Link>

        <div className="flex items-center gap-2">
          {user?.loggedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs text-gray-500 font-mono">
                  {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                </span>
              </div>
              <button
                onClick={fcl.unauthenticate}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              onClick={fcl.authenticate}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"/></svg>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
