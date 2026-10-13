import { defineCard } from "../define.js";

// EDHREC rank 7141.

const TEXT = "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";
const HARMONIZE_TEXT =
  "Harmonize {4}{G} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)";

export default defineCard({
  name: "Roamer's Routine",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${TEXT}\n${HARMONIZE_TEXT}`,
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
  harmonize: { cost: "{4}{G}" },
});
