# Security

This repository only publishes public frontend code, public GenLayer Studionet contract metadata, and contract source.

Do not commit wallet private keys, seed phrases, `.env.local`, Vercel tokens, GitHub tokens, encrypted vaults, local dashboard data, or machine-specific paths. The included `.gitignore` and `.vercelignore` are configured to keep those files out of Git and Vercel uploads.

Public environment values such as `NEXT_PUBLIC_CONTRACT_ADDRESS`, Studionet RPC URLs, and explorer URLs are safe to expose.
