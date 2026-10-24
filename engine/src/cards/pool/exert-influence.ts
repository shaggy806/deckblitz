import { defineCard } from "../define.js";

// EDHREC rank 25965.
//
// Prismatic Ending's converge gate: the creature's power is checked as the
// spell resolves (the ruling) — too great and nothing happens. The control
// change has no end, and doesn't care about later changes to its power.
const TEXT =
  "Converge — Gain control of target creature if its power is less than or equal to the number of colors of mana spent to cast this spell.";

export default defineCard({
  name: "Exert Influence",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "target",
      index: 0,
      filter: { power: { op: "lte", n: { amount: { colorsSpentOf: "source" } } } },
    },
    then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
  },
});
