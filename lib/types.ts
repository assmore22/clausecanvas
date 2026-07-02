export type ClauseStatus =
  | "draft" | "submitted" | "under_review" | "risk_flagged" | "approved" | "challenged" | "appealed" | "finalized" | "archived";
export type ReviewStatus =
  | "submitted" | "assessed" | "accepted" | "revision_requested" | "rejected" | "challenged" | "appealed" | "finalized";
export type Verdict = "" | "approve" | "revise" | "reject" | "high_risk";
export type ChallengeStatus = "open" | "upheld" | "dismissed";
export type AppealStatus = "open" | "accepted" | "denied";

export interface ClauseSet {
  clauseSetId: string;
  owner: string;
  title: string;
  documentType: string;
  jurisdictionLabel: string;
  oldClauseText: string;
  newClauseText: string;
  sourceUrls: string[];
  reviewRubric: string[];
  status: ClauseStatus;
  createdAt: number;
  selectedReviewId: string;
  reviewIds: string[];
  challengeIds: string[];
  appealIds: string[];
  auditTrailIds: string[];
}

export interface Review {
  reviewId: string;
  clauseSetId: string;
  reviewer: string;
  reviewerNote: string;
  evidenceUrls: string[];
  riskScore: number;
  clarityScore: number;
  verdict: Verdict;
  reviewSummary: string;
  riskyChanges: string[];
  missingProtections: string[];
  contradictionFlags: string[];
  injectionFlags: string[];
  status: ReviewStatus;
  createdAt: number;
  rawAssessmentJson: string;
}

export interface Challenge {
  challengeId: string;
  clauseSetId: string;
  reviewId: string;
  challenger: string;
  reason: string;
  evidenceUrls: string[];
  status: ChallengeStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Appeal {
  appealId: string;
  clauseSetId: string;
  reviewId: string;
  appellant: string;
  reason: string;
  evidenceUrls: string[];
  status: AppealStatus;
  reviewJson: string;
  createdAt: number;
}

export interface Profile {
  address: string;
  clauseSetsCreated: number;
  reviewsSubmitted: number;
  reviewsAccepted: number;
  reviewsRejected: number;
  challengesWon: number;
  challengesLost: number;
  appealsWon: number;
  appealsLost: number;
  reputationScore: number;
  lastActivity: number;
}

export interface AuditRecord {
  auditId: string;
  action: string;
  actor: string;
  clauseSetId: string;
  reviewId: string;
  challengeId: string;
  appealId: string;
  summary: string;
  statusAfter: string;
  at: number;
}

export interface PublicStats {
  clauseSets: number;
  reviews: number;
  challenges: number;
  appeals: number;
  flaggedClauseSets: number;
  approvedClauseSets: number;
  openChallenges: number;
  openAppeals: number;
  auditRecords: number;
  clock: number;
}

export interface DiffSummary {
  clauseSetId: string;
  status: string;
  oldChars: number;
  newChars: number;
  oldWords: number;
  newWords: number;
  addedTerms: string[];
  removedTerms: string[];
  addedCount: number;
  removedCount: number;
  changeRatioPct: number;
  topVerdict: string;
  reviewCount: number;
}

/** Verdict → tone used for redline colors and chips. */
export type VerdictTone = "approve" | "revise" | "risk" | "neutral";
export function toneOf(verdict?: string): VerdictTone {
  if (verdict === "approve") return "approve";
  if (verdict === "revise") return "revise";
  if (verdict === "reject" || verdict === "high_risk") return "risk";
  return "neutral";
}
