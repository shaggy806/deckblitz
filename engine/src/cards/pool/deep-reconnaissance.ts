import { defineCard } from "../define.js";

export default defineCard({
  name: "Deep Reconnaissance",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{4}{G}" },
  text: "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.\nFlashback {4}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
});
