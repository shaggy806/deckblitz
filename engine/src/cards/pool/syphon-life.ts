import { defineCard } from "../define.js";

export default defineCard({
  name: "Syphon Life",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  retrace: true,
  text: "Target player loses 2 life and you gain 2 life.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
