import { defineCard } from "../define.js";

const TEXT = "Tap all lands target player controls and that player loses all unspent mana.";

// EDHREC rank 15581. It even taps lands that don't produce mana (the ruling).
// The loss is `lose-unspent-mana` (rule 106.4), not a step ending, so "you
// don't lose … as steps and phases end" is no help against it.
export default defineCard({
  name: "Mana Short",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap-all", filter: { type: "land", controlledBy: "you" }, controlledByTarget: 0 },
      { kind: "lose-unspent-mana", target: 0 },
    ],
  },
});
