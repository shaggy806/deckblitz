import { defineCard } from "../define.js";

// EDHREC rank 20088. Reality Fracture.
//
// Rulings:
//   [2026-08-21] If this land enters at the same time as a planeswalker, that planeswalker isn't
//     considered when determining if this land enters the battlefield tapped or untapped.

export default defineCard({
  name: "Transformative Commons",
  colors: [],
  types: ["land"],
  text: "This land enters tapped unless you control a planeswalker.\n{T}: Add {G} or {U}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { type: "planeswalker" }, atLeast: 1 },
      },
      text: "This land enters tapped unless you control a planeswalker.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {U}.",
    },
  ],
});
