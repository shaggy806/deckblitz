import { defineCard } from "../define.js";

// EDHREC rank 11721.
//
// The copy is `become-copy` until end of turn (rule 707.2: copiable values
// only — no counters, tapped state or other effects; the first creature keeps
// its own counters and non-copy effects, rule 707.4 — the rulings). The second
// slot is "up to one other": with none chosen, or that one illegal as the
// spell resolves, the first still gains hexproof and untaps (the ruling, rule
// 608.2b).
const TEXT =
  "Target creature you control gains hexproof until end of turn. Untap that creature. Until end of turn, it becomes a copy of up to one other target creature.";

export default defineCard({
  name: "Fleeting Reflection",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [
    "creature-you-control",
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
      { kind: "become-copy", target: 0, of: 1, until: "end-of-turn" },
    ],
  },
});
