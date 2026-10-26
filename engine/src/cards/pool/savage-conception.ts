import { defineCard } from "../define.js";

// Makes Beast → use "3/3 Beast Token".

export default defineCard({
  name: "Savage Conception",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  retrace: true,
  text: "Create a 3/3 green Beast creature token.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: { kind: "create-token", token: "3/3 Beast Token", count: 1 },
});
