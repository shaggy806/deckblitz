import { defineCard } from "../define.js";

// EDHREC rank 8073.

export default defineCard({
  name: "Obsessive Search",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  madness: { cost: "{U}" },
  text: "Draw a card.\nMadness {U} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  effect: { kind: "draw", amount: 1 },
});
