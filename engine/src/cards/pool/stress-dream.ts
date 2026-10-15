import { defineCard } from "../define.js";

// EDHREC rank 19676.
//
// The damage's target is "up to one": with none chosen, the look still
// happens; with one chosen that has become illegal, the spell doesn't resolve
// at all (rule 608.2b — the second ruling).
//
// Rulings:
//   [2026-03-20] If there is only one card in your library, you put it into your hand.
//   [2026-03-20] You don't have to choose a target for Stress Dream. However, if you do and the
//     target creature is an illegal target as Stress Dream tries to resolve, it won't resolve and
//     none of its effects will happen. You won't look at any cards in your library.

export default defineCard({
  name: "Stress Dream",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Stress Dream deals 5 damage to up to one target creature. Look at the top two cards of your library. Put one of those cards into your hand and the other on the bottom of your library.",
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
    ],
  },
});
