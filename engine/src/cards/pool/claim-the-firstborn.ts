import { defineCard } from "../define.js";

// EDHREC rank 6877.
//
// Rulings:
//   [2019-10-04] Gaining control of a creature doesn't cause you to gain control of any Auras or
//     Equipment attached to it.
//   [2019-10-04] Claim the Firstborn can target any creature with mana value 3 or less, even one
//     that's untapped or one you already control.
//   [2019-10-04] If a creature on the battlefield has {X} in its mana cost, X is considered to be 0.
//
// Act of Treason's shape, its target narrowed by mana value.
export default defineCard({
  name: "Claim the Firstborn",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature with mana value 3 or less until end of turn. Untap that creature. It gains haste until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
