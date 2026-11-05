import { defineCard } from "../define.js";

// EDHREC rank 12828.
//
// Rulings:
//   [2024-04-12] Take for a Ride can target any creature, even one that's untapped or one you
//     already control.
//
// "Has flash as long as you've committed a crime this turn" is `flashIf`,
// read as the cast begins (rule 601.3d); the rest is Act of Treason's.
export default defineCard({
  name: "Take for a Ride",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashIf: { condition: { kind: "committed-crime-this-turn" } },
  text: "Take for a Ride has flash as long as you've committed a crime this turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\nGain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
