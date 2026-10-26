import { defineCard } from "../define.js";

export default defineCard({
  name: "Raven's Crime",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  retrace: true,
  text: "Target player discards a card.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
});
