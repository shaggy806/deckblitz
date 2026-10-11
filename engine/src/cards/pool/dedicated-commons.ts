import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 19183.
//
// Rulings:
//   [2026-08-21] If this land enters at the same time as a planeswalker, that planeswalker isn't
//     considered when determining if this land enters the battlefield tapped or untapped.

const TAPPED_TEXT = "This land enters tapped unless you control a planeswalker.";
const MANA_TEXT = "{T}: Add {R} or {W}.";

export default defineCard({
  name: "Dedicated Commons",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${MANA_TEXT}`,
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
      effect: { kind: "add-mana", mana: { oneOf: ["R", "W"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
