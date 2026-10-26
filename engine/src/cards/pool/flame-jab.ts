import { defineCard } from "../define.js";

export default defineCard({
  name: "Flame Jab",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  retrace: true,
  text: "Flame Jab deals 1 damage to any target.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 1, target: 0 },
});
