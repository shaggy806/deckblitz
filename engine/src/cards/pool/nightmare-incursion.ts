import { defineCard } from "../define.js";

// EDHREC rank 22448. X is counted as it resolves.

export default defineCard({
  name: "Nightmare Incursion",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search target player's library for up to X cards, where X is the number of Swamps you control, and exile them. Then that player shuffles.",
  targets: ["player"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: {},
    destination: "exile",
    min: 0,
    max: { countOf: { subtype: "Swamp", controlledBy: "you" } },
  },
});
