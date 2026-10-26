import { defineCard } from "../define.js";

export default defineCard({
  name: "Oona's Grace",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  retrace: true,
  text: "Target player draws a card.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: ["player"],
  effect: { kind: "draw", amount: 1, target: 0 },
});
