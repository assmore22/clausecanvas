export function truncateHex(v: string, lead = 6, tail = 4): string {
  if (!v) return "";
  return v.length <= lead + tail + 1 ? v : `${v.slice(0, lead)}…${v.slice(-tail)}`;
}

export function isHttpUrl(v: string): boolean {
  const s = v.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  try { new URL(s); return true; } catch { return false; }
}

export function hostOf(u: string): string {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

const EX = (process.env.NEXT_PUBLIC_GENLAYER_EXPLORER ?? "https://explorer-studio.genlayer.com").replace(/\/$/, "");
export const explorerTx = (h: string) => `${EX}/tx/${h}`;
export const explorerAddr = (a: string) => `${EX}/address/${a}`;
export const explorerContract = (a: string) => `${EX}/contracts/${a}`;

const norm = (w: string) => w.toLowerCase().replace(/^[.,;:()"']+|[.,;:()"']+$/g, "");

/** Token-level added/removed sets (mirrors the contract's diff logic). */
export function diffTerms(oldText: string, newText: string): { added: Set<string>; removed: Set<string> } {
  const o = new Set((oldText || "").split(/\s+/).map(norm).filter(Boolean));
  const n = new Set((newText || "").split(/\s+/).map(norm).filter(Boolean));
  const added = new Set<string>();
  const removed = new Set<string>();
  n.forEach((w) => { if (!o.has(w)) added.add(w); });
  o.forEach((w) => { if (!n.has(w)) removed.add(w); });
  return { added, removed };
}

export interface Token { text: string; changed: boolean }
export function tokenize(text: string, changedSet: Set<string>): Token[] {
  return (text || "").split(/(\s+)/).map((t) => (t.trim() === "" ? { text: t, changed: false } : { text: t, changed: changedSet.has(norm(t)) }));
}
