import { defineCard } from "../define.js";

// EDHREC rank 18911.
//
// Rulings:
//   [2024-01-12] If you don't pay the overload cost of a spell with overload, that spell will have
//     a single target. If you pay the overload cost, the spell won't have any targets.
//   [2024-01-12] If you are instructed to cast a spell with overload "without paying its mana
//     cost," you can't choose to pay its overload cost instead.
//   [2024-01-12] Because a spell with overload doesn't target when its overload cost is paid, it
//     may affect permanents with hexproof or with protection from the appropriate color.
//
// Mizzium Mortars' overload shape; the overloaded half is Eagles of the North's.

export default defineCard({
  name: "Weapon Surge",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 and gains first strike until end of turn.\nOverload {1}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
  overload: {
    cost: "{1}{R}",
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
        {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you" },
          keyword: "first-strike",
          duration: "end-of-turn",
        },
      ],
    },
  },
});
