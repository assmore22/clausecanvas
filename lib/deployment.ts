/** Static deployment facts (public hashes only). */
export const DEPLOYMENT = {
  network: "GenLayer Studionet",
  chainId: 61999,
  deployer: "0x1B68490588b03de872D99719F2a265720498d24d",
  contractAddress: "0xB1A464be815082A2c025ec8512A1925AEa2338c9",
  deployTxHash: "0x1bc37d57cb0fc97181aef6e97b2f26819fc422c0a4b9eddc8b5fa7040d1032d6",
  faucetTxHash: "0x5247ab5e73021e4dcecbc01be514ed32826603117ce83333c0153a4a32cc5c1f",
  smoke: [
    { label: "create_clause_set", hash: "0x6460e908944d12105a87982163dc3c2c13675803b1ef96b9cc3f4769268d91db" },
    { label: "submit_review", hash: "0xb3a9922a892ce3612b42445098a13683764d7665e42dbf138a017d7cccce35f5" },
    { label: "assess_review (high_risk/90/65)", hash: "0xb6c62322329d9bc768315e42f39e03a2fea48ef4229f7be09efba40c1d955d15" },
    { label: "challenge_review", hash: "0xe0aa63ec8995f478d51a28d25e45ee1e478303d11ecdaabfc288a60e6759bcfc" },
    { label: "file_appeal", hash: "0x36db52bb3633dce9f11bba412870837a4a5692750514ebbcedf38c41717472ec" },
    { label: "resolve_challenge (dismissed)", hash: "0xf84d65727669dd0c6a10dbe43df8bfe3f510638ba586b3d06df6c339d6f29978" },
    { label: "resolve_appeal (denied)", hash: "0x820eefe652983763cccce9179d09a3229684e79ab2d05837d3f4cdbccef2f10a" },
    { label: "reopen_for_revision", hash: "0xf495504bb5b9c7ffd7cd61d5cc68bb63d41a0317b1b54bdb0e7d28d90092298a" },
    { label: "finalize_clause_set", hash: "0x5c1c7859306350f7589cc987e05cc1b0c91a2c99bb9d06510b2d553522ed1220" },
    { label: "archive_clause_set", hash: "0x1788845723a2b9a0a6c7efce73908696892a3fdb78862447c09849fb1612ece2" },
  ],
} as const;
