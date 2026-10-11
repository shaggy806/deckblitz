import { defineCard } from "../define.js";

// EDHREC rank 20240.
//
// Rulings:
//   [2026-08-21] If this land enters at the same time as a planeswalker, that planeswalker isn't
//     considered when determining if this land enters the battlefield tapped or untapped.
//
// The condition is read before the land moves (rule 614.12), so a
// planeswalker entering alongside it doesn't count — the ruling.

const TAPPED_TEXT = "This land enters tapped unless you control a planeswalker.";

export default defineCard({
  name: "Stingerquill Annex",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n{T}: Add {B} or {R}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { type: "planeswalker" }, atLeast: 1 },
      },
      text: TAPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "R"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {R}.",
    },
  ],
});
