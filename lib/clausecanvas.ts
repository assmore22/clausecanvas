"use client";

import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus, type TransactionHash } from "genlayer-js/types";
import type { ClauseSet, Review, Challenge, Appeal, Profile, AuditRecord, PublicStats, DiffSummary } from "./types";

export const CONTRACT = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0xB1A464be815082A2c025ec8512A1925AEa2338c9"
).trim();
export const NETWORK = "studionet";

export function hasContract(): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(CONTRACT);
}

const A = CONTRACT as `0x${string}`;

let _read: ReturnType<typeof createClient> | null = null;
function rc() {
  if (!_read) _read = createClient({ chain: studionet, account: createAccount() });
  return _read;
}

function parseObj<T>(raw: unknown): T | null {
  if (typeof raw !== "string" || !raw.trim() || raw.trim() === "{}") return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}
function parseArr<T>(raw: unknown): T[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try { const a = JSON.parse(raw); return Array.isArray(a) ? (a as T[]) : []; } catch { return []; }
}
async function call(fn: string, args: unknown[] = []) {
  if (!hasContract()) throw new Error("no_contract");
  return rc().readContract({ address: A, functionName: fn, args: args as never[] });
}

/* ── reads ── */
export const getPublicStats = async (): Promise<PublicStats | null> => parseObj<PublicStats>(await call("get_public_stats"));
export const getRecentClauseSets = async (limit = 40): Promise<ClauseSet[]> => parseArr<ClauseSet>(await call("get_recent_clause_sets", [limit]));
export const getFlaggedClauseSets = async (limit = 40): Promise<ClauseSet[]> => parseArr<ClauseSet>(await call("get_flagged_clause_sets", [limit]));
export const getApprovedClauseSets = async (limit = 40): Promise<ClauseSet[]> => parseArr<ClauseSet>(await call("get_approved_clause_sets", [limit]));
export const getClauseSet = async (id: string): Promise<ClauseSet | null> => parseObj<ClauseSet>(await call("get_clause_set", [id]));
export const getReview = async (id: string): Promise<Review | null> => parseObj<Review>(await call("get_review", [id]));
export const getChallenge = async (id: string): Promise<Challenge | null> => parseObj<Challenge>(await call("get_challenge", [id]));
export const getAppeal = async (id: string): Promise<Appeal | null> => parseObj<Appeal>(await call("get_appeal", [id]));
export const getProfile = async (addr: string): Promise<Profile | null> => parseObj<Profile>(await call("get_profile", [addr]));
export const getClauseSetReviews = async (id: string): Promise<Review[]> => parseArr<Review>(await call("get_clause_set_reviews", [id]));
export const getOwnerClauseSets = async (addr: string): Promise<ClauseSet[]> => parseArr<ClauseSet>(await call("get_owner_clause_sets", [addr]));
export const getReviewerReviews = async (addr: string): Promise<Review[]> => parseArr<Review>(await call("get_reviewer_reviews", [addr]));
export const getOpenChallenges = async (limit = 50): Promise<Challenge[]> => parseArr<Challenge>(await call("get_open_challenges", [limit]));
export const getOpenAppeals = async (limit = 50): Promise<Appeal[]> => parseArr<Appeal>(await call("get_open_appeals", [limit]));
export const getAuditTrail = async (id: string): Promise<AuditRecord[]> => parseArr<AuditRecord>(await call("get_audit_trail", [id]));
export const getClauseDiffSummary = async (id: string): Promise<DiffSummary | null> => parseObj<DiffSummary>(await call("get_clause_diff_summary", [id]));

/* ── writes (signed by the RainbowKit-connected injected wallet) ── */
function isBusy(e: unknown): boolean {
  const m = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return m.includes("execution slots") || m.includes("server busy") || m.includes("busy");
}
export function busyMessage(e: unknown): string {
  if (isBusy(e)) return "Studionet is busy (all execution slots occupied). Wait a moment and retry.";
  return e instanceof Error ? e.message : String(e);
}

export async function writeMethod(address: `0x${string}`, fn: string, args: unknown[]): Promise<`0x${string}`> {
  const client = createClient({ chain: studionet, account: address });
  await client.connect(NETWORK as never);
  const hash = await client.writeContract({ address: A, functionName: fn, args: args as never[], value: 0n });
  return hash as `0x${string}`;
}
export async function waitAccepted(address: `0x${string}`, hash: `0x${string}`): Promise<void> {
  const client = createClient({ chain: studionet, account: address });
  await client.waitForTransactionReceipt({
    hash: hash as unknown as TransactionHash,
    status: TransactionStatus.ACCEPTED,
    interval: 5000,
    retries: 90,
  });
}
