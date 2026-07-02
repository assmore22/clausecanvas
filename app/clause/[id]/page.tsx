"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faPenRuler, faMagnifyingGlassChart, faGavel, faScaleBalanced, faCircleCheck,
  faBoxArchive, faRotateLeft, faRotateRight, faFileLines, faClockRotateLeft, faLink,
} from "@fortawesome/free-solid-svg-icons";
import { RedlineBoard } from "@/components/RedlineBoard";
import { AuditTimeline } from "@/components/AuditTimeline";
import { StatusChip, VerdictBadge, Banner, Empty, RedactedLines, Hex, ExtLink } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getClauseSet, getClauseSetReviews, getAuditTrail, getClauseDiffSummary, hasContract } from "@/lib/clausecanvas";
import { hostOf, isHttpUrl } from "@/lib/format";
import { toneOf, type Review } from "@/lib/types";

type Tab = "redline" | "reviews" | "audit";

export default function ClauseDetailPage() {
  const id = String(useParams().id);
  const [tab, setTab] = useState<Tab>("redline");
  const { run, busy, address } = useTx();

  const cs = useLoader(() => getClauseSet(id), [id]);
  const reviews = useLoader(() => getClauseSetReviews(id), [id]);
  const audit = useLoader(() => getAuditTrail(id), [id]);
  const diff = useLoader(() => getClauseDiffSummary(id), [id]);

  const reloadAll = () => { cs.reload(); reviews.reload(); audit.reload(); diff.reload(); };
  const c = cs.data;
  const isOwner = !!address && !!c && c.owner.toLowerCase() === address.toLowerCase();
  const top = (reviews.data ?? [])[0];
  const tone = toneOf(top?.verdict);
  const riskTags = top ? [...top.riskyChanges, ...top.injectionFlags].slice(0, 5) : [];

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to view this clause set.</Banner>;

  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" /> Redline workspace</Link>

      {cs.loading && !c ? <RedactedLines rows={3} /> :
        cs.error ? <Banner tone="danger" title="Failed to load clause set" action={<button className="btn btn-ghost btn-xs" onClick={cs.reload}>Retry</button>}>{cs.error}</Banner> :
        !c ? <Empty title={`Clause set #${id} not found`} hint="It may not exist on this contract." /> :
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faPenRuler} /> Clause set #{c.clauseSetId} · {c.documentType}</div>
              <h1 className="mt-1 serif text-2xl font-semibold tracking-tight">{c.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>Owner <Hex value={c.owner} /></span>
                <span>Jurisdiction <span className="text-ink">{c.jurisdictionLabel || "-"}</span></span>
                {diff.data && <span>Change ratio <span className="mono text-ink">{diff.data.changeRatioPct}%</span> ({diff.data.addedCount}+ / {diff.data.removedCount}−)</span>}
              </div>
            </div>
            <StatusChip status={c.status} kind="clause" />
          </div>

          {c.sourceUrls.length > 0 && <div className="flex flex-wrap gap-3 text-xs">{c.sourceUrls.map((u) => <ExtLink key={u} href={u}><FontAwesomeIcon icon={faLink} className="h-2.5 w-2.5" /> {hostOf(u)}</ExtLink>)}</div>}

          {isOwner && (
            <div className="doc flex flex-wrap items-center gap-2 p-3">
              <span className="label mr-1">Owner controls</span>
              {!["draft", "submitted", "archived", "finalized"].includes(c.status) && c.reviewIds.length > 0 && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("Finalize clause set", "finalize_clause_set", [c.clauseSetId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> Finalize</button>}
              {["risk_flagged", "approved", "challenged", "appealed", "finalized"].includes(c.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Reopen for revision", "reopen_for_revision", [c.clauseSetId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faRotateLeft} className="h-3 w-3" /> Reopen</button>}
              {c.status === "finalized" && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => run("Archive clause set", "archive_clause_set", [c.clauseSetId]).then((h) => h && reloadAll())}><FontAwesomeIcon icon={faBoxArchive} className="h-3 w-3" /> Archive</button>}
            </div>
          )}

          <div className="flex items-center justify-between border-b border-line">
            <div className="flex gap-1">
              {([["redline", faPenRuler, 0], ["reviews", faFileLines, reviews.data?.length ?? 0], ["audit", faClockRotateLeft, audit.data?.length ?? 0]] as const).map(([t, icon, n]) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`tab ${tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
                  <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" /> {t}{t !== "redline" ? <span className="mono text-xs opacity-70">{n}</span> : null}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-xs" onClick={reloadAll}><FontAwesomeIcon icon={faRotateRight} className="h-3 w-3" /> Refresh</button>
          </div>

          {tab === "redline" && <RedlineBoard oldText={c.oldClauseText} newText={c.newClauseText} tone={tone} riskTags={riskTags} height={340} />}
          {tab === "reviews" && <ReviewsTab clauseSetId={id} reviews={reviews.data} loading={reviews.loading} error={reviews.error} reload={reviews.reload} onAction={reloadAll} run={run} busy={busy} />}
          {tab === "audit" && (
            audit.loading && !audit.data ? <RedactedLines rows={4} /> :
            (audit.data?.length ?? 0) === 0 ? <Empty icon={faClockRotateLeft} title="No audit records" /> :
            <div className="doc p-4"><AuditTimeline records={audit.data!} /></div>
          )}
        </>}
    </div>
  );
}

function ReviewsTab({
  clauseSetId, reviews, loading, error, reload, onAction, run, busy,
}: {
  clauseSetId: string; reviews?: Review[]; loading: boolean; error: string | null; reload: () => void;
  onAction: () => void; run: ReturnType<typeof useTx>["run"]; busy: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"challenge" | "appeal" | null>(null);
  const [reason, setReason] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  if (loading && !reviews) return <RedactedLines rows={4} />;
  if (error) return <Banner tone="danger" title="Failed to load reviews" action={<button className="btn btn-ghost btn-xs" onClick={reload}>Retry</button>}>{error}</Banner>;
  if (!reviews || reviews.length === 0) return <Empty icon={faFileLines} title="No reviews yet" hint="Submit a redline review from the Review tab." />;

  const start = (rid: string, m: "challenge" | "appeal") => { setOpenId(rid); setMode(m); setReason(""); setUrls([]); };
  const submit = async (r: Review) => {
    const fn = mode === "challenge" ? "challenge_review" : "file_appeal";
    const label = mode === "challenge" ? "Challenge review" : "File appeal";
    const h = await run(label, fn, [clauseSetId, r.reviewId, reason.trim(), urls]);
    if (h) { setOpenId(null); setMode(null); onAction(); }
  };

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div key={r.reviewId} className="doc p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><span className="text-sm font-semibold">Review #{r.reviewId}</span><StatusChip status={r.status} kind="review" /><VerdictBadge verdict={r.verdict} risk={r.riskScore} clarity={r.clarityScore} /></div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{r.reviewerNote}</p>
              <div className="mt-1 text-xs text-muted">reviewer <Hex value={r.reviewer} /></div>
            </div>
          </div>
          {r.reviewSummary && <p className="mt-2 text-xs text-muted">{r.reviewSummary}</p>}
          {(r.riskyChanges.length > 0 || r.missingProtections.length > 0) && (
            <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
              {r.riskyChanges.length > 0 && <div><div className="label text-danger">Risky changes</div><ul className="mt-1 list-disc pl-4 text-muted">{r.riskyChanges.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
              {r.missingProtections.length > 0 && <div><div className="label text-warning">Missing protections</div><ul className="mt-1 list-disc pl-4 text-muted">{r.missingProtections.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
            </div>
          )}
          {r.evidenceUrls.length > 0 && <div className="mt-2 flex flex-wrap gap-2 text-xs">{r.evidenceUrls.map((u) => <ExtLink key={u} href={u}>{hostOf(u)}</ExtLink>)}</div>}

          <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
            {["submitted", "revision_requested"].includes(r.status) && <button className="btn btn-primary btn-xs" disabled={busy} onClick={() => run("Assess review", "assess_review", [clauseSetId, r.reviewId]).then((h) => h && onAction())}><FontAwesomeIcon icon={faMagnifyingGlassChart} className="h-3 w-3" /> Run AI assessment</button>}
            {["assessed", "accepted", "revision_requested", "rejected", "finalized"].includes(r.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => start(r.reviewId, "challenge")}><FontAwesomeIcon icon={faGavel} className="h-3 w-3" /> Challenge</button>}
            {["rejected", "revision_requested", "challenged", "accepted"].includes(r.status) && <button className="btn btn-ghost btn-xs" disabled={busy} onClick={() => start(r.reviewId, "appeal")}><FontAwesomeIcon icon={faScaleBalanced} className="h-3 w-3" /> Appeal</button>}
          </div>

          {openId === r.reviewId && mode && (
            <div className="mt-3 space-y-3 rounded-md border border-line bg-bg p-3">
              <div className="text-sm font-semibold capitalize">{mode} review #{r.reviewId}</div>
              <label className="block"><span className="label">Reason</span><textarea className="field mt-1.5 min-h-[70px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={mode === "challenge" ? "Why is this assessment wrong?" : "Why should this be reconsidered?"} /></label>
              <ListInput label="Evidence URLs" items={urls} onChange={setUrls} placeholder="https://source.example/evidence" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
              <div className="flex justify-end gap-2"><button className="btn btn-ghost btn-xs" onClick={() => { setOpenId(null); setMode(null); }}>Cancel</button><button className="btn btn-primary btn-xs" disabled={busy || !reason.trim()} onClick={() => submit(r)}>{busy ? "Submitting…" : `Submit ${mode}`}</button></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
