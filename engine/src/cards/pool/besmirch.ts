import { defineCard } from "../define.js";

// EDHREC rank 11254.
//
// Rulings:
//   [2016-08-23] Gaining control of a creature doesn't cause you to gain control of any Auras or
//     Equipment attached to it.
//   [2016-08-23] Besmirch can target any creature, including one you already control or one
//     that's untapped.
//   [2016-08-23] The creature you gain control of must attack during your turn if able.
//
// Edea's / Act of Treason's threaten, then goaded by you until your next turn
// (rule 701.15a) — so on your own turn it attacks one of your opponents if able.

export default defineCard({
  name: "Besmirch",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Until end of turn, gain control of target creature and it gains haste. Untap and goad that creature. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
      { kind: "goad", target: 0 },
    ],
  },
});
