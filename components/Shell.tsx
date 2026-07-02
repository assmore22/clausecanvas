"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenRuler, faFileCirclePlus, faScaleBalanced, faUserPen, faFolderOpen, faTriangleExclamation, faCircleNodes,
} from "@fortawesome/free-solid-svg-icons";
import { ClauseCanvasLogo } from "./ClauseCanvasLogo";
import { WalletConnect } from "./WalletConnect";
import { WALLETCONNECT_PROJECT_ID } from "@/app/providers";
import { hasContract, CONTRACT } from "@/lib/clausecanvas";
import { CHAIN_ID } from "@/lib/studionet";
import { Hex } from "./ui";

const TABS = [
  { href: "/", label: "Redline", icon: faPenRuler },
  { href: "/submit", label: "Review", icon: faFileCirclePlus },
  { href: "/disputes", label: "Disputes", icon: faScaleBalanced },
  { href: "/profile", label: "Profile", icon: faUserPen },
  { href: "/registry", label: "Registry", icon: faFolderOpen },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top command bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-document/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1500px] items-center justify-between gap-3 px-4 lg:px-6">
          <Link href="/" className="shrink-0"><ClauseCanvasLogo /></Link>
          <div className="hidden items-center gap-2 text-xs text-muted md:flex">
            <FontAwesomeIcon icon={faCircleNodes} className="h-3 w-3 text-accent" />
            <span>Studionet · chain {CHAIN_ID}</span>
            <span className="text-line">|</span>
            <span>{hasContract() ? <Hex value={CONTRACT} kind="contract" lead={6} tail={4} /> : <span className="text-warning">contract not set</span>}</span>
          </div>
          <WalletConnect />
        </div>
        {/* Document tabs */}
        <nav className="mx-auto flex w-full max-w-[1500px] items-center gap-1 overflow-x-auto px-2 lg:px-4">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href}
              className={`tab shrink-0 ${active(t.href) ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"}`}>
              <FontAwesomeIcon icon={t.icon} className="h-3.5 w-3.5" /> {t.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-4 p-4 lg:p-6">
        {!WALLETCONNECT_PROJECT_ID && (
          <div className="flex items-start gap-2.5 rounded-md border border-warning/40 bg-warning/5 p-2.5 text-xs text-muted">
            <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-3.5 w-3.5 text-warning" />
            <span><span className="font-semibold text-ink">Local dev:</span> no WalletConnect project id set - injected wallets (MetaMask) work; the WalletConnect QR flow is disabled. Set <span className="mono">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</span> to enable it.</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
