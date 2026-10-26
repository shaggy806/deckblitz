import { defineCard } from "../define.js";

// EDHREC rank 9497.
export default defineCard({
  name: "Increasing Ambition",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{7}{B}" },
  text: "Search your library for a card and put that card into your hand. If this spell was cast from a graveyard, instead search your library for two cards and put those cards into your hand. Then shuffle.\nFlashback {7}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castFrom: "graveyard" } },
    then: { kind: "search-library", filter: {}, destination: "hand", min: 2, max: 2 },
    else: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
  },
});
