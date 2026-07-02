"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus, faCircleCheck, faArrowRight, faPenRuler } from "@fortawesome/free-solid-svg-icons";
import { RedlineBoard } from "@/components/RedlineBoard";
import { StatusChip, Banner, Empty, RedactedLines } from "@/components/ui";
import { ListInput } from "@/components/inputs";
import { useTx } from "@/components/Tx";
import { useLoader } from "@/lib/hooks";
import { getRecentClauseSets, hasContract } from "@/lib/clausecanvas";
import { isHttpUrl } from "@/lib/format";
import { toneOf } from "@/lib/types";

export default function SubmitReviewPage() {
  const { run, busy, connected, wrongNetwork } = useTx();
  const sets = useLoader(() => getRecentClauseSets(60), []);
  const [csId, setCsId] = useState("");
  const [note, setNote] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const list = (sets.data ?? []).filter((c) => ["submitted", "under_review", "risk_flagged", "approved", "challenged", "appealed"].includes(c.status));
  const selected = list.find((c) => c.clauseSetId === csId);
  const valid = !!selected && note.trim().length > 0;

  const submit = async () => {
    if (!selected) return;
    const h = await run("Submit review", "submit_review", [selected.clauseSetId, note.trim(), urls]);
    if (h) { setDone(selected.clauseSetId); setNote(""); setUrls([]); sets.reload(); }
  };

  if (!hasContract()) return <Banner tone="warn" title="No contract configured">Set the contract address to submit reviews.</Banner>;

  return (
    <div className="space-y-4">
      <div>
        <div className="label flex items-center gap-2"><FontAwesomeIcon icon={faFileCirclePlus} /> Reviewer intake</div>
        <h1 className="mt-1 serif text-2xl font-semibold tracking-tight">Submit a redline review</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Add a reviewer note and evidence for a clause set. The AI reviewer reads the sources live and scores risk + clarity.</p>
      </div>

      {!connected && <Banner tone="warn" title="Connect a wallet">Connect your wallet to submit a review.</Banner>}
      {connected && wrongNetwork && <Banner tone="warn" title="Wrong network">Switch to GenLayer Studionet - we’ll prompt on submit.</Banner>}
      {done && <Banner tone="ok" title="Review submitted" action={<Link className="btn btn-ghost btn-xs" href={`/clause/${done}`}>Open clause set <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" /></Link>}>It now awaits AI assessment on clause set #{done}.</Banner>}

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,380px)]">
        <div className="doc space-y-4 p-4">
          <div>
            <span className="label">Target clause set</span>
            {sets.loading && !sets.data ? <div className="mt-1.5"><RedactedLines rows={2} /></div> :
              sets.error ? <div className="mt-1.5"><Banner tone="danger" title="Failed to load clause sets" action={<button className="btn btn-ghost btn-xs" onClick={sets.reload}>Retry</button>}>{sets.error}</Banner></div> :
              list.length === 0 ? <div className="mt-1.5"><Empty title="No reviewable clause sets" hint="Create a clause set first." /></div> :
              <select className="field mt-1.5" value={csId} onChange={(e) => setCsId(e.target.value)}>
                <option value="">Select a clause set…</option>
                {list.map((c) => <option key={c.clauseSetId} value={c.clauseSetId}>#{c.clauseSetId} - {c.title}</option>)}
              </select>}
          </div>
          <label className="block"><span className="label">Reviewer note</span><textarea className="field mt-1.5 min-h-[120px]" value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} placeholder="Summarize the redline risks you observe in the new clause…" /><span className="mt-1 block text-right text-[11px] text-muted">{note.length}/2000</span></label>
          <ListInput label="Evidence URLs (max 6)" items={urls} onChange={setUrls} placeholder="https://docs.example/policy" max={6} validate={(v) => (isHttpUrl(v) ? null : "Must be an http(s) URL.")} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{valid ? <span className="inline-flex items-center gap-1 text-accent"><FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" /> Ready</span> : "Select a clause set and add a reviewer note."}</span>
            <button type="button" className="btn btn-primary" disabled={!valid || busy} onClick={submit}>{busy ? "Submitting…" : "Submit review"}</button>
          </div>
        </div>

        <div className="space-y-3">
          {selected ? (
            <>
              <div className="doc p-3"><div className="mb-2 flex items-center justify-between"><span className="label">Redline preview</span><StatusChip status={selected.status} kind="clause" /></div><RedlineBoard oldText={selected.oldClauseText} newText={selected.newClauseText} tone={toneOf()} riskTags={[]} height={240} /></div>
              <div className="doc space-y-1 p-4">
                <div className="serif text-sm font-semibold">{selected.title}</div>
                <div className="text-xs text-muted">{selected.documentType} · {selected.jurisdictionLabel}</div>
                <div className="label mt-2">Rubric</div>
                <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted">{selected.reviewRubric.slice(0, 6).map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
            </>
          ) : (
            <div className="doc"><Empty icon={faPenRuler} title="Pick a clause set" hint="Select a clause set to preview the redline." /></div>
          )}
        </div>
      </div>
    </div>
  );
}
