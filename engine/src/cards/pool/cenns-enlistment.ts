import { defineCard } from "../define.js";

// Makes Kithkin Soldier → use "Kithkin Soldier Token".

export default defineCard({
  name: "Cenn's Enlistment",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  retrace: true,
  text: "Create two 1/1 white Kithkin Soldier creature tokens.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: { kind: "create-token", token: "Kithkin Soldier Token", count: 2 },
});
