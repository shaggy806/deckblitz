import { defineCard } from "../define.js";

// EDHREC rank 9706.

export default defineCard({
  name: "Mystical Teachings",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{5}{B}" },
  text: "Search your library for an instant card or a card with flash, reveal it, put it into your hand, then shuffle.\nFlashback {5}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { anyOf: [{ type: "instant" }, { keyword: "flash" }] },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
