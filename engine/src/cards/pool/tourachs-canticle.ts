import { defineCard } from "../define.js";

// Coercion's `discard-chosen`, then Hypnotic Specter's random discard from
// what's left — two discards, so two madness cards trigger separately (the
// ruling).
const TEXT =
  "Target opponent reveals their hand. You choose a card from it. That player discards that card, then discards a card at random.";

export default defineCard({
  name: "Tourach's Canticle",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0 },
      { kind: "discard", target: 0, amount: 1, random: true },
    ],
  },
});
