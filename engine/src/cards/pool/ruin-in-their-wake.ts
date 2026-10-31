import { defineCard } from "../define.js";

// "You may put that card onto the battlefield tapped if you control a land
// named Wastes. Otherwise, put that card into your hand": `instead`'s
// `condition` (read as it resolves) and `pick: "any"` — without a Wastes the
// find simply goes to the hand.
export default defineCard({
  name: "Ruin in Their Wake",
  manaCost: "{1}{G}",
  colors: [],
  types: ["sorcery"],
  text:
    "Devoid (This card has no color.)\nSearch your library for a basic land card and reveal it. You may put that card onto the battlefield tapped if you control a land named Wastes. Otherwise, put that card into your hand. Then shuffle.",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    instead: {
      destination: "battlefield",
      enterTapped: true,
      condition: { kind: "controls", filter: { type: "land", name: "Wastes" }, atLeast: 1 },
      pick: "any",
    },
  },
});
