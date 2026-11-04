import { defineCard } from "../define.js";

// Exactly X, not "up to": as many as the hand holds when it holds fewer (rule 609.3).

export default defineCard({
  name: "Mind Warp",
  manaCost: "{X}{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at target player's hand and choose X cards from it. That player discards those cards.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, lookOnly: true, picks: "x" },
});
