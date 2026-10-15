import { defineCard } from "../define.js";

// EDHREC rank 29339.
//
// "Each of one or two target creatures": a required slot and an optional
// second that must be a different creature (rule 601.2c — Prismari Charm's
// shape).

export default defineCard({
  name: "Predictive Preparations",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{3}{W}" },
  text: "Put a +1/+1 counter on each of one or two target creatures.\nFlashback {3}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
