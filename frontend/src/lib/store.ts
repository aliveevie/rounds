import { create } from "zustand";

export interface RoundInfo {
  roundId: string;
  creator: string;
  memberCount: string;
  contributionAmount: string;
  periodSeconds: string;
  state: string;
  currentPeriod: string;
  members: string[];
  turnOrder: string[];
  turnMode: string;
  vaultBalance: string;
  createdAt: string;
  periodStartTime: string;
  contributionsThisPeriod: Record<string, string>;
  reputation: Record<string, string>;
}

interface AppState {
  user: { addr: string | null; loggedIn: boolean } | null;
  rounds: RoundInfo[];
  loading: boolean;
  setUser: (user: { addr: string | null; loggedIn: boolean } | null) => void;
  setRounds: (rounds: RoundInfo[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  rounds: [],
  loading: false,
  setUser: (user) => set({ user }),
  setRounds: (rounds) => set({ rounds }),
  setLoading: (loading) => set({ loading }),
}));

export const STATE_LABELS: Record<string, string> = {
  "0": "Pending",
  "1": "Active",
  "2": "Distributing",
  "3": "Complete",
  "4": "Cancelled",
};

export const STATE_COLORS: Record<string, string> = {
  "0": "bg-yellow-100 text-yellow-800",
  "1": "bg-green-100 text-green-800",
  "2": "bg-blue-100 text-blue-800",
  "3": "bg-gray-100 text-gray-800",
  "4": "bg-red-100 text-red-800",
};
