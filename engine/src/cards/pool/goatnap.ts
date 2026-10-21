import { defineCard } from "../define.js";

// EDHREC rank 14839.
//
// Rulings:
//   [2019-06-14] To determine whether the target creature gets +3/+0, look at its creature types
//     after you've gained control of it, untapped it, and given it haste.
//   [2019-06-14] Goat is a creature type. Creatures with the changeling ability are Goats.
//
// The Goat check is a `conditional` read after the first three steps, as the
// ruling says; a `subtype` filter sees changeling.

export default defineCard({
  name: "Goatnap",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. If that creature is a Goat, it also gets +3/+0 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Goat" } },
        then: { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      },
    ],
  },
});
