import { defineCard } from "../define.js";

// Homelands. EDHREC rank 24887.
export default defineCard({
  name: "Renewal",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a land.\nSearch your library for a basic land card, put that card onto the battlefield, then shuffle.\nDraw a card at the beginning of the next turn's upkeep.",
  additionalCost: { sacrifice: { type: "land" } },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
