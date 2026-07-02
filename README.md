# ClauseCanvas

## Live Links

- App: https://clausecanvas.vercel.app
- Repository: https://github.com/assmore22/clausecanvas
The contract is shaped around policies, claims, source checks and settlement outcomes instead of a simple yes/no oracle.

A GenLayer-powered contract and policy redline verification workspace.

## ClauseCanvas Brief

This repo is organized for review: the app can be opened locally, the contract source is present, and the deployed Studionet address is pinned in `deployment.json`.

- Folder: `projects/project-07-clausecanvas`
- Frontend shape: Next/Vite-style app folder
- Contract source: `contracts/ClauseCanvas.py`
- Build status: next build OK (9 routes, 0 type/lint errors; canvas aliased false for react-konva); contract 35192 bytes schema-valid; all 10 write methods executed on-chain; 16 read methods power the UI; RainbowKit+wagmi+viem...
- Logo asset: FontAwesome file-contract (faFileContract) + plain text wordmark 'ClauseCanvas'

## Coverage Mechanics

7 record types (ClauseSet/RedlineReview+embedded RiskAssessment/Challenge/Appeal/ReviewerProfile/AuditRecord) in DynArray[str] per type + TreeMap profiles + u256 clock; 10 write + 16 view methods (incl get_clause_diff_summary computing token-level added/removed terms + change ratio); nondet assess/challenge/appeal via gl.nondet.web.render + gl.nondet.exec_prompt inside gl.eq_principle.prompt_comparative; clause lifecycle draft->submitted->under_review->risk_flagged/approved->challenged->appealed->finalized->archived; review lifecycle submitted->assessed/accepted/revision_requested/rejected->challenged->appealed->finalized; injection-flag detection; deterministic clamped reputation; emulated owner/reviewer/flagged/approved/status indexes.

- Primary source: `contracts/ClauseCanvas.py` (35,192 bytes)
- Public write/action methods: 10
- Read methods: 16
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, indexed storage, append-only collections

Typical flow: `create_clause_set` -> `reopen_for_revision` -> `submit_review` -> `assess_review` -> `resolve_challenge` -> `challenge_review` -> `file_appeal` -> `archive_clause_set`

Useful reads: `get_clause_set`, `get_review`, `get_challenge`, `get_appeal`, `get_profile`, `get_recent_clause_sets`, `get_flagged_clause_sets`, `get_approved_clause_sets`

## Network Record

- Network: studionet (61999)
- Contract: [0xB1A464be815082A2c025ec8512A1925AEa2338c9](https://explorer-studio.genlayer.com/contracts/0xB1A464be815082A2c025ec8512A1925AEa2338c9)
- Deploy tx: [0x1bc37d57...1032d6](https://explorer-studio.genlayer.com/tx/0x1bc37d57cb0fc97181aef6e97b2f26819fc422c0a4b9eddc8b5fa7040d1032d6)
- Deployed at: 2026-06-22T15:28:29.959Z
- Smoke writes recorded: 10

Smoke coverage:

- create_clause_set: [0x6460e908...8d91db](https://explorer-studio.genlayer.com/tx/0x6460e908944d12105a87982163dc3c2c13675803b1ef96b9cc3f4769268d91db)
- submit_review: [0xb3a9922a...ce35f5](https://explorer-studio.genlayer.com/tx/0xb3a9922a892ce3612b42445098a13683764d7665e42dbf138a017d7cccce35f5)
- assess_review: [0xb6c62322...955d15](https://explorer-studio.genlayer.com/tx/0xb6c62322329d9bc768315e42f39e03a2fea48ef4229f7be09efba40c1d955d15)
- challenge_review: [0xe0aa63ec...59bcfc](https://explorer-studio.genlayer.com/tx/0xe0aa63ec8995f478d51a28d25e45ee1e478303d11ecdaabfc288a60e6759bcfc)
- file_appeal: [0x36db52bb...7472ec](https://explorer-studio.genlayer.com/tx/0x36db52bb3633dce9f11bba412870837a4a5692750514ebbcedf38c41717472ec)
- resolve_challenge: [0xf84d6572...f29978](https://explorer-studio.genlayer.com/tx/0xf84d65727669dd0c6a10dbe43df8bfe3f510638ba586b3d06df6c339d6f29978)

## Inspect The App

```powershell
cd <this-repository-folder>
npm install
npm run dev
```

Open the dev server URL printed by npm.

## Security Notes

The repo is designed for public GitHub/Vercel release. Keep `.env`, `.vercel/`, wallet vaults, private keys and local dashboard state out of git. The publisher script enforces these ignore rules before it pushes.
