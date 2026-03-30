declare module "@onflow/fcl" {
  export function config(cfg?: Record<string, string>): void;
  export function authenticate(): Promise<void>;
  export function unauthenticate(): Promise<void>;
  export function query(opts: {
    cadence: string;
    args?: (arg: typeof fclArg, t: unknown) => unknown[];
  }): Promise<unknown>;
  export function mutate(opts: {
    cadence: string;
    args?: (arg: typeof fclArg, t: unknown) => unknown[];
    limit?: number;
  }): Promise<string>;
  export function tx(txId: string): {
    onceSealed(): Promise<unknown>;
  };
  export const currentUser: {
    subscribe(callback: (user: { addr: string | null; loggedIn: boolean } | null) => void): void;
  };
  function fclArg(value: unknown, type: unknown): unknown;
  export { fclArg as arg };
}

declare module "@onflow/types" {
  export const UInt8: unknown;
  export const UInt64: unknown;
  export const UFix64: unknown;
  export const String: unknown;
  export const Address: unknown;
  export const Bool: unknown;
}
