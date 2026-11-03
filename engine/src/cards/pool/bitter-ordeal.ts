import { gravestorm } from "../helpers.js";
import { defineCard } from "../define.js";

// Extract's search, with gravestorm: each copy may be aimed at another player.

const GRAVESTORM =
  "Gravestorm (When you cast this spell, copy it for each permanent put into a graveyard this turn. You may choose new targets for the copies.)";

export default defineCard({
  name: "Bitter Ordeal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Search target player's library for a card and exile it. Then that player shuffles.\n${GRAVESTORM}`,
  targets: ["player"],
  effect: { kind: "search-library", whose: { target: 0 }, filter: {}, destination: "exile", min: 1, max: 1 },
  triggered: [{ ...gravestorm(), text: GRAVESTORM }],
});
