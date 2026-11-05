import { defineCard } from "../define.js";

export default defineCard({
  name: "Quiet Speculation",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Search target player's library for up to three cards with flashback and put them into that player's graveyard. Then the player shuffles.",
  targets: ["player"],
  effect: {
    kind: "search-library",
    whose: { target: 0 },
    filter: { hasFlashback: true },
    destination: "graveyard",
    min: 0,
    max: 3,
  },
});
