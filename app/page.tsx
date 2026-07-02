"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenRuler, faPlus, faRotateRight, faXmark, faArrowRight, faTriangleExclamation, faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { RedlineBoard } from "@/components/RedlineBoard";
import { AuditStrip } from "@/components/AuditTimeline";
import { StatusChip, VerdictBadge, Banner, Empty, RedactedLines, Stat, Hex } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import {
  getPublicStats, getRecentClauseSets, getClauseSetReviews, getAuditTrail, hasContract,
} from "@/lib/clausecanvas";
import { isHttpUrl } from "@/lib/format";
import { toneOf, type ClauseSet } from "@/lib/types";

export default function WorkspacePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);

  const stats = useLoader(() => getPublicStats(), []);
  const sets = useLoader<ClauseSet[]>(() => getRecentClauseSets(40), []);
  const list = sets.data ?? [];
  const cs = useMemo(() => list.find((c) => c.clauseSetId === selected) ?? list[0], [list, selected]);
  const csId = cs?.clauseSetId;

  const reviews = useLoader(() => (csId ? getClauseSetReviews(csId) : Promise.resolve([])), [csId]);
  const audit = useLoader(() => (csId ? getAuditTrail(csId) : Promise.resolve([])), [csId]);
  const topReview = (reviews.data ?? [])[0];
  const tone = toneOf(topReview?.verdict);
  const riskTags = topReview ? [...topReview.riskyChanges, ...topReview.injectionFlags, ...topReview.contradictionFlags].slice(0, 5) : [];

  if (!hasContract()) {
    return <Banner tone="warn" title="No contract configured">Set <span className="mono">NEXT_PUBLIC_CONTRACT_ADDRESS</span> in <span className="mono">.env.local</span> to load live clause sets.</Banner>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faPenRuler} /> Redline workspace</div>
          <h1 className="mt-1 serif text-2xl font-semibold tracking-tight">Clause redline review</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setDrawer(true)}><FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" /> New clause set</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.loading && !stats.data ? <div className="col-span-full"><RedactedLines rows={2} /></div> :
          stats.error ? <div className="col-span-full"><Banner tone="danger" title="Could not load stats" action={<button className="btn btn-ghost btn-xs" onClick={stats.reload}>Retry</button>}>{stats.error}</Banner></div> :
          <>
            <Stat label="Clause sets" value={stats.data?.clauseSets ?? 0} tone="primary" />
            <Stat label="Reviews" value={stats.data?.reviews ?? 0} />
            <Stat label="Flagged" value={stats.data?.flaggedClauseSets ?? 0} tone="danger" />
            <Stat label="Approved" value={stats.data?.approvedClauseSets ?? 0} tone="accent" />
            <Stat label="Open disputes" value={(stats.data?.openChallenges ?? 0) + (stats.data?.openAppeals ?? 0)} tone="warning" />
            <Stat label="Audit" value={stats.data?.auditRecords ?? 0} />
          </>}
      </div>

      {/* document tabs (clause set selector) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-line pb-px">
        {sets.loading && !sets.data ? <div className="py-2"><RedactedLines rows={1} /></div> :
          list.length === 0 ? <span className="px-2 py-2 text-xs text-muted">No clause sets yet - create one to start a redline.</span> :
          list.map((c) => (
            <button key={c.clauseSetId} type="button" onClick={() => setSelected(c.clauseSetId)}
              className={`tab shrink-0 ${cs?.clauseSetId === c.clauseSetId ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
              <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" /> <span className="max-w-[160px] truncate">{c.title}</span>
            </button>
          ))}
      </div>

      {/* center redline canvas + right risk inspector */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-2">
          {cs ? (
            <>
              <div className="flex items-center justify-between">
                <div className="serif text-base font-semibold">{cs.title} <span className="ml-1 text-xs font-normal text-muted">{cs.documentType}</span></div>
                <StatusChip status={cs.status} kind="clause" />
              </div>
              <RedlineBoard oldText={cs.oldClauseText} newText={cs.newClauseText} tone={tone} riskTags={riskTags} height={320} />
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Owner <Hex value={cs.owner} /></span>
                <Link href={`/clause/${cs.clauseSetId}`} className="inline-flex items-center gap-1 text-accent hover:underline">Open clause set #{cs.clauseSetId} <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" /></Link>
              </div>
            </>
          ) : (
            <div className="doc"><Empty icon={faPenRuler} title="No clause set selected" hint="Create a clause set to open the redline canvas." /></div>
          )}
        </section>

        {/* risk inspector */}
        <aside className="doc h-fit p-4">
          <div className="label mb-2">Risk inspector</div>
          {!cs ? <Empty title="-" hint="Select a clause set." /> :
            reviews.loading && !reviews.data ? <RedactedLines rows={4} /> :
            !topReview ? <Empty icon={faTriangleExclamation} title="No review yet" hint="Submit a redline review to run the AI risk assessment." /> :
            <div className="space-y-3">
              <VerdictBadge verdict={topReview.verdict} risk={topReview.riskScore} clarity={topReview.clarityScore} />
              {topReview.reviewSummary && <p className="text-sm text-muted">{topReview.reviewSummary}</p>}
              {topReview.riskyChanges.length > 0 && <Section title="Risky changes" items={topReview.riskyChanges} tone="danger" />}
              {topReview.missingProtections.length > 0 && <Section title="Missing protections" items={topReview.missingProtections} tone="warning" />}
              {topReview.contradictionFlags.length > 0 && <Section title="Contradictions" items={topReview.contradictionFlags} tone="warning" />}
              {topReview.injectionFlags.length > 0 && <Section title="Injection-like flags" items={topReview.injectionFlags} tone="danger" />}
            </div>}
        </aside>
      </div>

      {/* bottom audit strip */}
      <section className="doc">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <span className="label">Audit strip{cs ? ` · clause set #${cs.clauseSetId}` : ""}</span>
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => { audit.reload(); reviews.reload(); sets.reload(); stats.reload(); }}><FontAwesomeIcon icon={faRotateRight} className={`h-3 w-3 ${audit.loading ? "animate-spin" : ""}`} /> Refresh</button>
        </div>
        {audit.loading && !audit.data ? <div className="p-3"><RedactedLines rows={2} /></div> : <AuditStrip records={audit.data ?? []} />}
      </section>

      <CreateDrawer open={drawer} onClose={() => setDrawer(false)} onCreated={() => { setDrawer(false); sets.reload(); stats.reload(); }} />
    </div>
  );
}

function Section({ title, items, tone }: { title: string; items: string[]; tone: "danger" | "warning" }) {
  const c = tone === "danger" ? "text-danger" : "text-warning";
  return (
    <div>
      <div className={`label ${c}`}>{title}</div>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted">{items.slice(0, 5).map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}

/* ── GSAP slide-in create drawer ── */
function CreateDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { run, busy, connected, wrongNetwork } = useTx();

  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("Service Agreement");
  const [jur, setJur] = useState("Demo / non-legal");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [rubric, setRubric] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else if (mounted) {
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      if (panel.current) tl.to(panel.current, { xPercent: 100, duration: 0.25, ease: "power2.in" }, 0);
      if (overlay.current) tl.to(overlay.current, { opacity: 0, duration: 0.25 }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (mounted && open) {
      if (overlay.current) gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      if (panel.current) gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.28, ease: "power2.out" });
    }
  }, [mounted, open]);

  if (!mounted) return null;
  const valid = title.trim() && oldText.trim() && newText.trim() && oldText.length <= 4000 && newText.length <= 4000 && rubric.length > 0;

  const submit = async () => {
    const h = await run("Create clause set", "create_clause_set", [title.trim(), docType.trim() || "Other", jur.trim(), oldText.trim(), newText.trim(), sourceUrls, rubric]);
    if (h) onCreated();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div ref={overlay} className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div ref={panel} className="absolute right-0 top-0 flex h-full w-[min(94vw,520px)] flex-col border-l border-line bg-bg shadow-pop">
        <div className="flex items-center justify-between border-b border-line bg-document px-4 py-3">
          <h2 className="serif text-base font-semibold">New clause set</h2>
          <button type="button" className="text-muted hover:text-ink" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!connected && <Banner tone="warn" title="Connect a wallet">Use Connect to sign the create transaction.</Banner>}
          {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet; we’ll prompt on submit.</Banner>}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="label">Title</span><input className="field mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Website service clause redline review" /></label>
            <label className="block"><span className="label">Document type</span><input className="field mt-1.5" value={docType} onChange={(e) => setDocType(e.target.value)} /></label>
            <label className="block"><span className="label">Jurisdiction label</span><input className="field mt-1.5" value={jur} onChange={(e) => setJur(e.target.value)} /></label>
          </div>
          <label className="block"><span className="label">Old clause text</span><textarea className="field mt-1.5 min-h-[90px] serif" value={oldText} maxLength={4000} onChange={(e) => setOldText(e.target.value)} placeholder="The provider will deliver the website and provide reasonable support after launch." /><span className="mt-0.5 block text-right text-[11px] text-muted">{oldText.length}/4000</span></label>
          <label className="block"><span className="label">New clause text</span><textarea className="field mt-1.5 min-h-[90px] serif" value={newText} maxLength={4000} onChange={(e) => setNewText(e.target.value)} placeholder="The provider will deliver the website when convenient, may change scope without notice…" /><span className="mt-0.5 block text-right text-[11px] text-muted">{newText.length}/4000</span></label>
          <ListInput label="Source URLs" items={sourceUrls} onChange={setSourceUrls} placeholder="https://docs.example/terms" max={5} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
          <ListInput label="Review rubric (required)" items={rubric} onChange={setRubric} placeholder="flag unilateral scope changes" max={12} />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line bg-document px-4 py-3">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "Submitting…" : "Create clause set"}</button>
        </div>
      </div>
    </div>
  );
}
