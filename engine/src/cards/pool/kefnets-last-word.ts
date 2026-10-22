import { defineCard } from "../define.js";

// EDHREC rank 23500. Hour of Devastation. The control change lasts
// indefinitely; no land you control untaps during your next untap step,
// those that arrive later included (`skip-next-untap`, the rulings) — and
// none of it happens if the target is illegal (the whole spell doesn't
// resolve).
const TEXT =
  "Gain control of target artifact, creature, or enchantment. Lands you control don't untap during your next untap step.";

export default defineCard({
  name: "Kefnet's Last Word",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "skip-next-untap", filter: { type: "land" } },
    ],
  },
});
