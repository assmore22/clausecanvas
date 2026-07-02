"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { diffTerms } from "@/lib/format";
import type { VerdictTone } from "@/lib/types";

const TONE_COLOR: Record<VerdictTone, string> = {
  approve: "#0F766E",
  revise: "#B7791F",
  risk: "#B91C1C",
  neutral: "#756F64",
};
const PAPER = "#FFFDF7";
const INK = "#1E1B16";
const MUTED = "#756F64";
const LINE = "#D7CCBA";
const ADD = "#0F766E";
const REM = "#B91C1C";

interface Tok { text: string; x: number; y: number; w: number; changed: boolean }

function layout(text: string, innerW: number, charW: number, lineH: number, padX: number, padY: number): { toks: Tok[]; height: number } {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const toks: Tok[] = [];
  let x = padX, y = padY;
  const gap = charW + 2;
  for (const word of words) {
    const w = Math.max(charW * 2, word.length * charW + 2);
    if (x + w > innerW - padX && x > padX) { x = padX; y += lineH; }
    toks.push({ text: word, x, y, w, changed: false });
    x += w + gap;
  }
  return { toks, height: y + lineH + padY };
}

export function RedlineCanvas({
  oldText, newText, tone = "neutral", riskTags = [], width, height = 340,
}: {
  oldText: string; newText: string; tone?: VerdictTone; riskTags?: string[]; width: number; height?: number;
}) {
  const { added, removed } = useMemo(() => diffTerms(oldText, newText), [oldText, newText]);
  const norm = (s: string) => s.toLowerCase().replace(/^[.,;:()"']+|[.,;:()"']+$/g, "");

  const headerH = 30;
  const laneGap = 14;
  const laneW = Math.max(140, (width - laneGap) / 2);
  const charW = 7.2, lineH = 20, padX = 12, padY = 12, fontSize = 13;

  const oldL = layout(oldText, laneW, charW, lineH, padX, padY + headerH);
  const newL = layout(newText, laneW, charW, lineH, padX, padY + headerH);
  oldL.toks.forEach((t) => (t.changed = removed.has(norm(t.text))));
  newL.toks.forEach((t) => (t.changed = added.has(norm(t.text))));
  const bodyH = Math.max(oldL.height, newL.height, height) + (riskTags.length ? 56 : 8);

  const accent = TONE_COLOR[tone];

  return (
    <Stage width={width} height={bodyH}>
      <Layer>
        {/* lanes */}
        {[0, laneW + laneGap].map((lx, idx) => (
          <Group key={idx}>
            <Rect x={lx} y={0} width={laneW} height={bodyH - (riskTags.length ? 52 : 0)} fill={PAPER} stroke={LINE} cornerRadius={5} />
            <Rect x={lx} y={0} width={laneW} height={headerH} fill={idx === 0 ? "#F3EEE2" : "#EFF5F2"} cornerRadius={5} />
            <Rect x={lx} y={headerH - 1} width={laneW} height={1} fill={LINE} />
            <Text x={lx + padX} y={9} text={idx === 0 ? "OLD CLAUSE" : "NEW CLAUSE"} fontStyle="bold" fontFamily="Georgia, serif" fontSize={12} fill={idx === 0 ? MUTED : accent} />
          </Group>
        ))}

        {/* OLD tokens */}
        {oldL.toks.map((t, i) => (
          <Group key={`o${i}`}>
            {t.changed && <Rect x={t.x - 2} y={t.y - 2} width={t.w + 4} height={lineH - 2} fill={REM} opacity={0.14} cornerRadius={3} />}
            <Text x={t.x} y={t.y} text={t.text} fontSize={fontSize} fontFamily="Georgia, serif" fill={t.changed ? REM : INK} textDecoration={t.changed ? "line-through" : ""} />
          </Group>
        ))}
        {/* NEW tokens */}
        {newL.toks.map((t, i) => {
          const ox = laneW + laneGap;
          return (
            <Group key={`n${i}`}>
              {t.changed && <Rect x={ox + t.x - 2} y={t.y - 2} width={t.w + 4} height={lineH - 2} fill={ADD} opacity={0.16} cornerRadius={3} />}
              <Text x={ox + t.x} y={t.y} text={t.text} fontSize={fontSize} fontFamily="Georgia, serif" fontStyle={t.changed ? "bold" : "normal"} fill={t.changed ? ADD : INK} />
            </Group>
          );
        })}

        {/* connector line between lanes */}
        <Line points={[laneW + laneGap / 2, headerH, laneW + laneGap / 2, bodyH - (riskTags.length ? 56 : 4)]} stroke={LINE} dash={[4, 4]} strokeWidth={1} />

        {/* draggable verdict-colored risk annotation chips */}
        {riskTags.slice(0, 5).map((tag, i) => {
          const label = tag.length > 26 ? tag.slice(0, 25) + "…" : tag;
          const w = Math.max(60, label.length * 6.4 + 22);
          return (
            <Group key={`tag${i}`} x={laneW + laneGap + padX + (i % 2) * 150} y={bodyH - 46 + Math.floor(i / 2) * 22} draggable>
              <Rect width={w} height={18} fill={accent} opacity={0.14} stroke={accent} strokeWidth={1} cornerRadius={9} />
              <Rect x={6} y={6} width={6} height={6} fill={accent} cornerRadius={3} />
              <Text x={18} y={4} text={label} fontSize={10.5} fontFamily="ui-sans-serif, sans-serif" fill={accent} fontStyle="bold" />
            </Group>
          );
        })}
        {riskTags.length > 0 && <Text x={laneW + laneGap + padX} y={bodyH - 64} text="RISK ANNOTATIONS (drag to reposition)" fontSize={9} fontFamily="ui-sans-serif, sans-serif" fill={MUTED} />}
      </Layer>
    </Stage>
  );
}
