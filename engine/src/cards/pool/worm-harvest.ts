import { defineCard } from "../define.js";

export default defineCard({
  name: "Worm Harvest",
  manaCost: "{2}{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  retrace: true,
  text: "Create a 1/1 black and green Worm creature token for each land card in your graveyard.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: {
    kind: "create-token",
    token: "Worm Token",
    count: { countInGraveyard: { type: "land", ownedBy: "you" } },
  },
});
