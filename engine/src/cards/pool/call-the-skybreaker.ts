import { defineCard } from "../define.js";

// Makes Elemental → use "Elemental Token (5/5 Blue-Red Flying)".

export default defineCard({
  name: "Call the Skybreaker",
  manaCost: "{5}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  retrace: true,
  text: "Create a 5/5 blue and red Elemental creature token with flying.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: { kind: "create-token", token: "Elemental Token (5/5 Blue-Red Flying)", count: 1 },
});
