"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Profile } from "@/lib/types";

/** D3 horizontal bar chart of a reviewer's on-chain activity counters. */
export function RiskGraph({ profile }: { profile: Profile }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const data = [
      { k: "Clause sets", v: profile.clauseSetsCreated, c: "#7C2D12" },
      { k: "Reviews submitted", v: profile.reviewsSubmitted, c: "#0F766E" },
      { k: "Reviews accepted", v: profile.reviewsAccepted, c: "#0F766E" },
      { k: "Reviews rejected", v: profile.reviewsRejected, c: "#B91C1C" },
      { k: "Challenges won", v: profile.challengesWon, c: "#0F766E" },
      { k: "Challenges lost", v: profile.challengesLost, c: "#B7791F" },
      { k: "Appeals won", v: profile.appealsWon, c: "#0F766E" },
      { k: "Appeals lost", v: profile.appealsLost, c: "#B7791F" },
    ];
    const W = 480, rowH = 28, M = { top: 6, right: 32, bottom: 6, left: 132 };
    const H = M.top + M.bottom + data.length * rowH;
    const svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", H);
    svg.selectAll("*").remove();

    const max = Math.max(1, d3.max(data, (d) => d.v) ?? 1);
    const x = d3.scaleLinear().domain([0, max]).range([0, W - M.left - M.right]);
    const y = d3.scaleBand<string>().domain(data.map((d) => d.k)).range([M.top, H - M.bottom]).padding(0.32);
    const g = svg.append("g").attr("transform", `translate(${M.left},0)`);

    g.selectAll("line.track").data(data).join("line")
      .attr("x1", 0).attr("x2", x(max)).attr("y1", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2).attr("y2", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2)
      .attr("stroke", "#E5DCC9").attr("stroke-width", 1);

    g.selectAll("rect.bar").data(data).join("rect")
      .attr("x", 0).attr("y", (d) => y(d.k) ?? 0).attr("height", y.bandwidth()).attr("rx", 3)
      .attr("fill", (d) => d.c).attr("opacity", 0.88)
      .attr("width", 0).transition().duration(500).attr("width", (d) => Math.max(d.v > 0 ? 4 : 0, x(d.v)));

    svg.append("g").selectAll("text.lbl").data(data).join("text")
      .attr("x", M.left - 10).attr("y", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2 + 4).attr("text-anchor", "end")
      .attr("fill", "#756F64").attr("font-size", 11).text((d) => d.k);

    g.selectAll("text.val").data(data).join("text")
      .attr("x", (d) => x(d.v) + 6).attr("y", (d) => (y(d.k) ?? 0) + y.bandwidth() / 2 + 4)
      .attr("fill", "#1E1B16").attr("font-size", 11).attr("font-family", "ui-monospace, monospace").text((d) => d.v);
  }, [profile]);

  return <svg ref={ref} role="img" aria-label="Reviewer risk graph" />;
}
