"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faRotateRight, faFileContract, faArrowRight, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { StatusChip, Banner, Empty, RedactedLines, Hex, Copy, Stat } from "@/components/ui";
import { useLoader } from "@/lib/hooks";
import { getRecentClauseSets, getFlaggedClauseSets, getApprovedClauseSets, getPublicStats, hasContract, CONTRACT } from "@/lib/clausecanvas";
import { DEPLOYMENT } from "@/lib/deployment";
import { explorerAddr, explorerContract, explorerTx, truncateHex } from "@/lib/format";
import type { ClauseSet } from "@/lib/types";

type Filter = "recent" | "flagged" | "approved";

export default function RegistryPage() {
  const [filter, setFilter] = useState<Filter>("recent");
  const stats = useLoader(() => getPublicStats(), []);
  const sets = useLoader<ClauseSet[]>(
    () => (filter === "flagged" ? getFlaggedClauseSets(60) : filter === "approved" ? getApprovedClauseSets(60) : getRecentClauseSets(60)),
    [filter],
  );
  const contract = hasContract() ? CONTRACT : DEPLOYMENT.contractAddress;
  const list = sets.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faFolderOpen} /> Registry</div>
          <h1 className="mt-1 serif text-2xl font-semibold tracking-tight">Clause set registry</h1>
        </div>
        <button type="button" className="btn btn-ghost btn-xs" onClick={sets.reload}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${sets.loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Clause sets" value={stats.data?.clauseSets ?? 0} tone="primary" />
        <Stat label="Flagged" value={stats.data?.flaggedClauseSets ?? 0} tone="danger" />
        <Stat label="Approved" value={stats.data?.approvedClauseSets ?? 0} tone="accent" />
        <Stat label="Reviews" value={stats.data?.reviews ?? 0} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["recent", "flagged", "approved"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`btn btn-xs capitalize ${filter === f ? "btn-primary" : "btn-ghost"}`}>{f}</button>
        ))}
      </div>

      {!hasContract() && <Banner tone="warn" title="Frontend contract address not set">Showing the recorded deployment address below; set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> for live reads.</Banner>}

      {sets.loading && !sets.data ? <RedactedLines rows={5} /> :
        sets.error ? <Banner tone="danger" title="Failed to load clause sets" action={<button className="btn btn-ghost btn-xs" onClick={sets.reload}>Retry</button>}>{sets.error}</Banner> :
        list.length === 0 ? <Empty icon={faFolderOpen} title={`No ${filter} clause sets`} hint={filter === "recent" ? "Create the first clause set to begin." : `No clause sets are currently ${filter}.`} /> :
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Link key={c.clauseSetId} href={`/clause/${c.clauseSetId}`} className="doc group flex flex-col gap-2 p-4 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary"><FontAwesomeIcon icon={faFileContract} className="h-4 w-4" /></span>
                <StatusChip status={c.status} kind="clause" />
              </div>
              <div className="serif text-sm font-semibold text-ink group-hover:text-primary">{c.title}</div>
              <div className="text-xs text-muted">{c.documentType} · {c.jurisdictionLabel || "-"}</div>
              <div className="mt-auto flex items-center justify-between border-t border-line pt-2 text-xs text-muted">
                <span>{c.reviewIds.length} reviews</span>
                <span className="inline-flex items-center gap-1 text-accent">Open <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></span>
              </div>
            </Link>
          ))}
        </div>}

      {/* contract status + smoke proof */}
      <section className="doc">
        <div className="border-b border-line px-3 py-2"><h2 className="text-sm font-semibold">Contract status &amp; on-chain smoke proof</h2></div>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between"><span className="text-muted">Contract</span><Hex value={contract} kind="contract" lead={10} tail={8} /></div>
            <div className="flex items-center justify-between"><span className="text-muted">Network</span><span className="text-ink">{DEPLOYMENT.network} · chain {DEPLOYMENT.chainId}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted">Deployer</span><Hex value={DEPLOYMENT.deployer} /></div>
            <div className="flex items-center justify-between"><span className="text-muted">Deploy tx</span><Hex value={DEPLOYMENT.deployTxHash} kind="tx" /></div>
            <div className="flex items-center justify-between"><span className="text-muted">Faucet tx</span><Hex value={DEPLOYMENT.faucetTxHash} kind="tx" /></div>
            <a className="btn btn-ghost btn-xs mt-1" href={explorerContract(contract)} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" /> Contract on explorer</a>
          </div>
          <div className="overflow-hidden rounded-md border border-line">
            <div className="border-b border-line bg-bg px-3 py-1.5 label">10 write methods · proven on-chain</div>
            <ul className="max-h-56 divide-y divide-line overflow-y-auto text-xs">
              {DEPLOYMENT.smoke.map((s) => (
                <li key={s.hash} className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="font-medium text-ink">{s.label}</span>
                  <span className="flex items-center gap-1.5"><a href={explorerTx(s.hash)} target="_blank" rel="noreferrer" className="mono text-accent hover:underline">{truncateHex(s.hash, 8, 6)}</a><Copy value={s.hash} /></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
