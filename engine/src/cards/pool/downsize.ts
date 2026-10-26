import { defineCard } from "../define.js";

// EDHREC rank 21791.
//
// Rulings:
//   [2024-01-12] If you don't pay the overload cost of a spell with overload, that spell will have
//     a single target. If you pay the overload cost, the spell won't have any targets.
//   [2024-01-12] Because a spell with overload doesn't target when its overload cost is paid, it
//     may affect permanents with hexproof or with protection from the appropriate color.
//   [2024-01-12] If you are instructed to cast a spell with overload "without paying its mana
//     cost," you can't choose to pay its overload cost instead.
//
// Mizzium Mortars's overload shape.

export default defineCard({
  name: "Downsize",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature you don't control gets -4/-0 until end of turn.\nOverload {2}{U} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
  overload: {
    cost: "{2}{U}",
    effect: {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "opponent" },
      power: -4,
      toughness: 0,
      duration: "end-of-turn",
    },
  },
});
