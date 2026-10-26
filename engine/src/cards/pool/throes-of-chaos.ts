import { defineCard } from "../define.js";

export default defineCard({
  name: "Throes of Chaos",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  retrace: true,
  text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
