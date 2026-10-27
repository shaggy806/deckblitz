import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 30317. "Each of up to three targets" is three distinct optional
// slots, all dealt damage at once; threshold is read as the spell resolves
// ("instead if"), so it picks 4 or 2 for every target alike.

const AMOUNT = { ifCondition: { kind: "threshold" }, then: 4, else: 2 } as const;

export default defineCard({
  name: "Shower of Coals",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Shower of Coals deals 2 damage to each of up to three targets.\nThreshold — Shower of Coals deals 4 damage to each of those permanents and/or players instead if there are seven or more cards in your graveyard.",
  targets: distinctTargets(3, "any-target", { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: AMOUNT, target: 0 },
      { kind: "damage", amount: AMOUNT, target: 1 },
      { kind: "damage", amount: AMOUNT, target: 2 },
    ],
  },
});
