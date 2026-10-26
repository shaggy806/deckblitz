import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghostform",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Up to two target creatures can't be blocked this turn.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "unblockable", duration: "end-of-turn" },
    ],
  },
});
